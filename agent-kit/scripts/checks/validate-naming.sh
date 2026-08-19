#!/usr/bin/env bash
# NAMING-001 — no leftover doc/template example nouns in structural code.
# These are nouns commonly used as EXAMPLES in architecture docs, NOT your real domain.
# Edit this list to add your doc's specific example nouns.
set -euo pipefail

# Banned patterns: example nouns from common architecture docs/templates
# Only matches as identifiers (PascalCase/camelCase/snake_case class/function/variable names)
BANNED_NOUNS='OrderRepository|PricingRules|order_create|OrderCreateHandler'
BANNED_NOUNS+='|UserRepository|UserService|UserController'
BANNED_NOUNS+='|ProductRepository|ProductService|ProductHandler'
BANNED_NOUNS+='|InvoiceRepository|InvoiceService|InvoiceHandler'
BANNED_NOUNS+='|ShoppingCart|CartService|CartRepository'
BANNED_NOUNS+='|TodoRepository|TodoService|TodoHandler|TodoItem'
BANNED_NOUNS+='|BookRepository|BookService|BookHandler'
BANNED_NOUNS+='|EmployeeRepository|EmployeeService|EmployeeHandler'
BANNED_NOUNS+='|CustomerRepository|CustomerService|CustomerHandler'
BANNED_NOUNS+='|SampleEntity|ExampleEntity|DemoService|DemoHandler'

hits=$(grep -RnE "$BANNED_NOUNS" \
  --include='*.go' --include='*.kt' --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor \
  . 2>/dev/null \
  | grep -vE '(docs/|README|TEMPLATE|architecture\.md|reference|_test\.|test\.|spec\.)' || true)

if [ -n "$hits" ]; then
  echo "VIOLATION NAMING-001: found a doc/template example noun copied into real code:"
  echo "$hits"
  echo ""
  echo "These names come from architecture docs/templates, not your real domain."
  echo "Replace with your actual feature/entity name (e.g. WalletRepository, not OrderRepository)."
  exit 1
fi
echo "PASS NAMING-001"
