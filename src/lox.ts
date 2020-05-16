const fs = require("fs");
const readline = require("readline");

import { Token, TokenType } from "./tokentype";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Expr } from "./ast";
import { AstPrinter } from "./astprinter";
import { Interpreter, RuntimeError } from "./interpreter";
import { Stmt } from './stmt';
import { Resolver } from "./resolver";

async function prompt(query :string) :Promise<string> {
    const input = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => 
        input.question(query, function(ans: any) {
            input.close();
            resolve(ans);
        })
    );
}

class Lox {

    hadError :boolean = false;
    hadRuntimeError :boolean = false;
    isRepl :boolean = false;
    interpreter :Interpreter;

    constructor() { 
        this.interpreter = new Interpreter(this);
    }

    run(data :string) {
        const scanner = new Scanner(this, data);
        const tokens = scanner.scanTokens();

        const parser = new Parser(this, tokens);
        const statements :Stmt[] = parser.parse();

        if (this.hadError) return;

        const resolver = new Resolver(this, this.interpreter);
        resolver.resolveStatements(statements);

        if (this.hadError) return;
        
        this.interpreter.interpret(statements);
    }

    runFile(filename :string) {
        const data = fs.readFileSync(filename, 'utf8');
        this.run(data);

        if (this.hadError) process.exit(65);
        if (this.hadRuntimeError) process.exit(70);
    }

    async runPrompt() {
        for (;;) {
            let input = await prompt(">");
            this.run(input);
            this.hadError = false;
        }
    }

    start() {
        const args = process.argv.slice(2);
        if(args.length > 1) {
            console.log("Usage: lox [script]");
            process.exit(64);

        } else if (args.length === 1) {
            this.runFile(args[0]);

        } else {
            this.isRepl = true;
            this.runPrompt();
        }
    }

    runtimeError(error :RuntimeError) {
        console.log(`[line ${error.token.line}] ${error.message}`);
        console.log(error);
        this.hadRuntimeError = true;
    }

    error(line :number, message: string) {
        this.report(line, "", message);
    }

    tokenError(token :Token, message: string) {
        if(token.type === TokenType.EOF) {
            this.report(token.line, " at end ", message);
        } else {
            this.report(token.line, ` at ${token.lexeme} `, message);
        }
    }

    report(line: number, where: string, message: string) {
        console.log(`[${line}] Error ${where}: ${message}`);
    }
}

export {
    Lox
}

