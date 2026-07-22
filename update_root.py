import re

def add_reducer():
    with open("packages/node/procureiq-nextjs/src/shared/store/rootReducer.ts", "r") as f:
        content = f.read()
    features = ['email', 'github', 'sessions', 'workOrders', 'signup']
    imports = []
    reducers = []
    for f in features:
        folder = f.replace("workOrders", "work-orders")
        imports.append(f"import {f}Reducer from '@/features/{folder}/{f}Slice';")
        reducers.append(f"  {f}: {f}Reducer,")
    
    new_imports = "\n".join(imports) + "\n"
    content = re.sub(r"(import .*?;\n)(?=\nexport const rootReducer)", r"\1" + new_imports, content, count=1)
    
    new_reducers = "\n".join(reducers) + "\n"
    content = re.sub(r"(combineReducers\(\{.*?)(?=\}\);)", r"\1" + new_reducers, content, flags=re.DOTALL)
    with open("packages/node/procureiq-nextjs/src/shared/store/rootReducer.ts", "w") as f:
        f.write(content)

def add_saga():
    with open("packages/node/procureiq-nextjs/src/shared/store/rootSaga.ts", "r") as f:
        content = f.read()
    features = ['email', 'github', 'sessions', 'workOrders', 'signup']
    imports = []
    forks = []
    for f in features:
        folder = f.replace("workOrders", "work-orders")
        imports.append(f"import {{ {f}Saga }} from '@/features/{folder}/{f}Saga';")
        forks.append(f"    fork({f}Saga),")
    
    new_imports = "\n".join(imports) + "\n"
    content = re.sub(r"(import .*?;\n)(?=\nexport function\* rootSaga)", r"\1" + new_imports, content, count=1)
    
    new_forks = "\n".join(forks) + "\n"
    content = re.sub(r"(yield all\(\[.*?)(?=\]\);)", r"\1" + new_forks, content, flags=re.DOTALL)
    with open("packages/node/procureiq-nextjs/src/shared/store/rootSaga.ts", "w") as f:
        f.write(content)

add_reducer()
add_saga()
