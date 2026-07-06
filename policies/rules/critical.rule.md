- alway check memory and change log for references
- stricty follow all the rules policies/rules/codeQuality/coupling-strength-spectrum.md, policies/rules/codeQuality/dry.md, policies/rules/codeQuality/function-parameter-limit-rule.md,
policies/rules/codeQuality/package-namming-rules.md, policies/rules/codeQuality/prototype.md,policies/rules/codeQuality/srp.md, policies/rules/codeQuality/typecasting-rules.md

- alway update contracts first then migration related files if has change and then code 
- use existing library of package methods insted of writing code from scrach

- whenever de desided desisions we are making you have to kip update ascii tree accordingly desison tree in this file logs/change.log with time stamp and file name also do not explain in code just always add/update on point and follow consistancy in tree and if tree is going to biggger and bigger devide into short tree 

- example of change log

[timestamp] one line summery
└── File: file names and file path
    ├── Choice: 
    └── Changes:
        ├── feature-name-> changes
        └── affected files and what is affected

- whenever I say save this as memory that time you have to create add in last memory log same formate as change.log ascii tree update location logs/memory.log
