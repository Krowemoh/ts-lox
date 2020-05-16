import { Expr, Binary, Grouping, Literal, Unary, ExprVisitor } from './ast';
import { Token, TokenType } from './tokentype';
import { AstPrinter } from './astprinter';

const expression :Expr = new Binary(
    new Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(
        new Literal(45.67)));

console.log(new AstPrinter().print(expression));
