import re
import sys

def process_create_table(lines, active_schema):
    table_match = re.search(r'CREATE TABLE\s+"([^"]+)"', lines[0], re.IGNORECASE)
    table_name = table_match.group(1) if table_match else "unknown_table"
    
    new_lines = []
    new_lines.append(lines[0])
    
    body_lines = []
    alter_statements = []
    
    for line in lines[1:-1]:
        # Skip KEY and UNIQUE KEY declarations inside CREATE TABLE
        if re.search(r'^\s*(?:UNIQUE\s+|FULLTEXT\s+)?KEY\b', line, re.IGNORECASE):
            continue
        
        # Extract foreign key constraints to defer them to the end
        if "FOREIGN KEY" in line and "CONSTRAINT" in line:
            cleaned_constraint = line.strip().rstrip(',')
            schema_prefix = f'"{active_schema}".' if active_schema else ""
            alter_stmt = f'ALTER TABLE {schema_prefix}"{table_name}" ADD {cleaned_constraint};\n'
            alter_statements.append(alter_stmt)
            continue
        
        # Strip CHARACTER SET and COLLATE from column definitions
        line = re.sub(r'\bCHARACTER\s+SET\s+[a-zA-Z0-9_]+\b', '', line, flags=re.IGNORECASE)
        line = re.sub(r'\bCOLLATE\s+[a-zA-Z0-9_]+\b', '', line, flags=re.IGNORECASE)
        
        # Strip USING BTREE/HASH
        line = re.sub(r'\bUSING\s+BTREE\b', '', line, flags=re.IGNORECASE)
        line = re.sub(r'\bUSING\s+HASH\b', '', line, flags=re.IGNORECASE)
        
        # Convert blob types to BYTEA
        line = re.sub(r'\b(?:long|medium|tiny)?blob\b', 'BYTEA', line, flags=re.IGNORECASE)
        
        # Convert bit(1) to BOOLEAN first
        line = re.sub(r'\bbit\(1\)', 'BOOLEAN', line, flags=re.IGNORECASE)
        
        # If column is BOOLEAN, rewrite all MySQL boolean-style defaults to Postgres true/false
        if "BOOLEAN" in line.upper():
            line = re.sub(r"\bDEFAULT\s+b'[1\s]'", "DEFAULT true", line, flags=re.IGNORECASE)
            line = re.sub(r"\bDEFAULT\s+b'[0\0]'", "DEFAULT false", line, flags=re.IGNORECASE)
            line = re.sub(r"\bDEFAULT\s*\(\s*0\s*\)", "DEFAULT false", line, flags=re.IGNORECASE)
            line = re.sub(r"\bDEFAULT\s*\(\s*1\s*\)", "DEFAULT true", line, flags=re.IGNORECASE)
            line = re.sub(r"\bDEFAULT\s+['\"]?0['\"]?", "DEFAULT false", line, flags=re.IGNORECASE)
            line = re.sub(r"\bDEFAULT\s+['\"]?1['\"]?", "DEFAULT true", line, flags=re.IGNORECASE)
            
        # Strip ON UPDATE CURRENT_TIMESTAMP clauses
        line = re.sub(r'\bON\s+UPDATE\s+CURRENT_TIMESTAMP(?:\(\))?\b', '', line, flags=re.IGNORECASE)
        
        # Convert MySQL-specific data types to Postgres equivalents
        line = re.sub(r'\bint\(\d+\)(?:\s+unsigned)?', 'INTEGER', line, flags=re.IGNORECASE)
        line = re.sub(r'\bint(?:\s+unsigned)?\b', 'INTEGER', line, flags=re.IGNORECASE)
        line = re.sub(r'\bbigint\(\d+\)(?:\s+unsigned)?', 'BIGINT', line, flags=re.IGNORECASE)
        line = re.sub(r'\bbigint(?:\s+unsigned)?\b', 'BIGINT', line, flags=re.IGNORECASE)
        line = re.sub(r'\btinyint\(\d+\)(?:\s+unsigned)?', 'SMALLINT', line, flags=re.IGNORECASE)
        line = re.sub(r'\btinyint\b', 'SMALLINT', line, flags=re.IGNORECASE)
        line = re.sub(r'\bdouble\b', 'DOUBLE PRECISION', line, flags=re.IGNORECASE)
        line = re.sub(r'\bdatetime\(\d+\)', 'TIMESTAMP', line, flags=re.IGNORECASE)
        line = re.sub(r'\bdatetime\b', 'TIMESTAMP', line, flags=re.IGNORECASE)
        line = re.sub(r'\blongtext\b', 'TEXT', line, flags=re.IGNORECASE)
        line = re.sub(r'\bmediumtext\b', 'TEXT', line, flags=re.IGNORECASE)
        line = re.sub(r'\btinytext\b', 'TEXT', line, flags=re.IGNORECASE)

        line = re.sub(r'\bAUTO_INCREMENT\b', '', line, flags=re.IGNORECASE)
        
        body_lines.append(line)
        
    # Clean up trailing comma on the last valid line inside the CREATE TABLE body
    last_idx = -1
    for i in range(len(body_lines) - 1, -1, -1):
        if body_lines[i].strip() and not body_lines[i].strip().startswith('--'):
            last_idx = i
            break
            
    if last_idx != -1:
        cleaned = body_lines[last_idx].rstrip()
        if cleaned.endswith(','):
            body_lines[last_idx] = cleaned[:-1] + '\n'
            
    new_lines.extend(body_lines)
    new_lines.append(lines[-1])
    return new_lines, alter_statements

def convert_sql(input_path, output_path):
    print(f"Converting {input_path} to {output_path}...")
    
    all_alter_statements = []
    active_schema = None
    
    with open(input_path, "r", encoding="utf-8", errors="ignore") as f_in, \
         open(output_path, "w", encoding="utf-8") as f_out:
        
        # Write config settings at the very top
        f_out.write("SET standard_conforming_strings = off;\n")
        f_out.write("SET backslash_quote = on;\n\n")
        
        in_create_table = False
        table_buffer = []
        
        for line in f_in:
            # Skip company table data inserts to avoid invalid binary byte sequences
            if "INSERT INTO" in line and ("`company`" in line or '"company"' in line or "company" in line.lower()):
                continue
                
            # 1. Skip or comment out MySQL specific settings
            if re.match(r"^\s*/\*!.*?\*/\s*;?\s*$", line):
                continue
            if "LOCK TABLES" in line or "UNLOCK TABLES" in line:
                continue
            if "DISABLE KEYS" in line or "ENABLE KEYS" in line:
                continue
            
            # 2. Convert CREATE DATABASE to CREATE SCHEMA
            db_match = re.search(r"CREATE DATABASE\s+(?:/\*!32312\s+IF\s+NOT\s+EXISTS\*/\s+)?`([^`]+)`.*", line, re.IGNORECASE)
            if db_match:
                db_name = db_match.group(1)
                active_schema = db_name
                line = f'CREATE SCHEMA IF NOT EXISTS "{db_name}";\n'
                f_out.write(line)
                continue
            
            # 3. Convert USE db_name to SET search_path TO db_name
            use_match = re.search(r"USE\s+`([^`]+)`\s*;", line, re.IGNORECASE)
            if use_match:
                db_name = use_match.group(1)
                active_schema = db_name
                line = f'SET search_path TO "{db_name}";\n'
                f_out.write(line)
                continue
                
            # 4. Handle table creation settings at the end of CREATE TABLE
            if "ENGINE=" in line:
                line = re.sub(r"\)\s*ENGINE\s*=\s*[a-zA-Z0-9_]+.*?;", ");", line, flags=re.IGNORECASE)
            
            # 5. Convert backticks to double quotes for identifiers
            line = line.replace("`", '"')
            
            # 6. Process CREATE TABLE statements in blocks
            if "CREATE TABLE" in line:
                in_create_table = True
                table_buffer = [line]
                continue
                
            if in_create_table:
                table_buffer.append(line)
                if ");" in line or line.strip() == ");":
                    in_create_table = False
                    processed, alter_stmts = process_create_table(table_buffer, active_schema)
                    all_alter_statements.extend(alter_stmts)
                    for l in processed:
                        # Convert _binary values inside create table if any
                        l = re.sub(r"_binary\s+'\\x01'", 'true', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\\u0001'", 'true', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\x01'", 'true', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\\x00'", 'false', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\\u0000'", 'false', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\\0'", 'false', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\x00'", 'false', l, flags=re.IGNORECASE)
                        l = re.sub(r"_binary\s+'\s'", 'true', l, flags=re.IGNORECASE)
                        f_out.write(l)
                continue
            
            # 7. Convert _binary values in INSERT statements
            line = re.sub(r"_binary\s+'\\x01'", 'true', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\\u0001'", 'true', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\x01'", 'true', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\\x00'", 'false', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\\u0000'", 'false', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\\0'", 'false', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\x00'", 'false', line, flags=re.IGNORECASE)
            line = re.sub(r"_binary\s+'\s'", 'true', line, flags=re.IGNORECASE)
            
            # Map any remaining _binary '...' payload (e.g. image bytes) to NULL to prevent encoding crashes
            line = re.sub(r"_binary\s+'(?:[^'\\]|\\.)*'", "NULL", line, flags=re.IGNORECASE)
            
            # Cleanup inline comments
            if re.match(r"^\s*/\*!.*?\*/\s*;?\s*$", line):
                continue
            line = re.sub(r"/\*!\d+\s+(.*?)\s*\*/", r"\1", line)
            
            f_out.write(line)
            
        # Write all alter table statements (foreign keys) at the very end of the file
        if all_alter_statements:
            f_out.write("\n\n-- Deferred Foreign Key Constraints --\n\n")
            for stmt in all_alter_statements:
                f_out.write(stmt)
                
    print("Done!")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_mysql_to_pg.py <input_sql> <output_sql>")
        sys.exit(1)
    convert_sql(sys.argv[1], sys.argv[2])
