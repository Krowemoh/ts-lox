# Challenges

# Scanner

1. The lexical grammars of Python and Haskell are not regular. What does that
mean, and why aren’t they?

2. Aside from separating tokens—distinguishing print foo from
printfoo—spaces aren’t used for much in most languages. However, in a
couple of dark corners, a space does affect how code is parsed in
CoffeeScript, Ruby, and the C preprocessor. Where and what effect does
it have in each of those languages?

3. Our scanner here, like most, discards comments and whitespace since
those aren’t needed by the parser. Why might you want to write a
scanner that does not discard those? What would it be useful for?

4. Add support to Lox’s scanner for C-style /* ... */ block
comments. Make sure to handle newlines in them. Consider
allowing them to nest. Is adding support for nesting more work
than you expected? Why?

# AST

1. Earlier, I said that the |, *, and + forms we added to our grammar metasyntax
were just syntactic sugar. Given this grammar:

expr → expr ( "(" ( expr ( "," expr )* )? ")" | "." IDENTIFIER )*
| IDENTIFIER
| NUMBER

Produce a grammar that matches the same language but does not use any
of that notational sugar.

Bonus: What kind of expression does this bit of grammar encode?

2. The Visitor pattern lets you emulate the functional style in an object-oriented
language. Devise a corresponding pattern in a functional language. It should let
you bundle all of the operations on one type together and let you define new
types easily.

(SML or Haskell would be ideal for this exercise, but Scheme or another Lisp
works as well.)

`
Not going to do this, but I have seen it in the lisp videos where they dispatch
on type. Don't remember how they did it though.
`

3. In Reverse Polish Notation (RPN), the operands to an arithmetic operator are
both placed before the operator, so 1 + 2 becomes 1 2 +. Evaluation proceeds
from left to right. Numbers are pushed onto an implicit stack. An arithmetic
operator pops the top two numbers, performs the operation, and pushes the
result. Thus, this:

(1 + 2) * (4 - 3)

in RPN becomes:

1 2 + 4 3 - *

Define a visitor class for our syntax tree classes that takes an expression,
converts it to RPN, and returns the resulting string.

`
I didn't rewrite it into a seperate class but the logic of it I get, it was a
simple change to get into RPN form because instead of pushing stuff on I just
needed to unshift onto the string. Very neat and it's clear how the structure of
the AST is really open to modifications. Very happy with this.
`
