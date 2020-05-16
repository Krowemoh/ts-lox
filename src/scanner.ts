import { Token, TokenType, keywords } from "./tokentype";
import { Lox } from './lox';

class Scanner {
    lox :Lox;
    source: string;
    tokens: Token[] = [];
    start: number = 0;
    current: number = 0;
    line: number = 1;

    constructor(lox: Lox, source :string) {
        this.lox = lox;
        this.source = source;
    }

    advance() :string {
        this.current++;
        return this.source[this.current-1];
    }

    addToken(type: TokenType, literal :any) {
        const text: string = this.source.slice(this.start, this.current);
        this.tokens.push(new Token(type, text, literal,this.line));
    }

    isAtEnd() :boolean { 
        return this.current >= this.source.length; 
    }

    scanTokens() :Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    match(expected: string) :boolean {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] !== expected) return false;
        this.current++;
        return true;
    }
    
    peek() :string {
        if (this.isAtEnd()) return "\0";
        return this.source[this.current];
    }

    peekNext() :string {
        if (this.current+1 >= this.source.length) return "\0";
        return this.source[this.current+1];
    }

    string() :void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === "\n") this.line++;
            this.advance();
        }
        
        if (this.isAtEnd()) {
            this.lox.error(this.line, "Unterminated string.");
            return;
        }

        this.advance();

        const value = this.source.slice(this.start, this.current);
        this.addToken(TokenType.STRING, value);
    }

    number() :void {
        while(this.isDigit(this.peek())) this.advance();
        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            this.advance();
            while(this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.NUMBER, 
                 parseFloat(this.source.slice(this.start, this.current))
        );
    }

    identifier() :void {
        while(this.isAlphanumeric(this.peek())) this.advance();

        const text :string = this.source.slice(this.start, this.current);
        let type = keywords.get(text);

        if (keywords.has(text)) {
            this.addToken(keywords.get(text), null);
        } else this.addToken(TokenType.IDENTIFIER, null);
    }

    isDigit(c :string) :boolean {
        return c >= '0' && c <= '9';
    }

    isAlpha(c :string) :boolean {
        return (c >= 'a' && c <= 'z')
            || (c >= 'A' && c <= 'Z') 
            || c === '_';
    }

    isAlphanumeric(c :string) {
        return this.isAlpha(c) || this.isDigit(c);
    }

    scanToken() {
        let c = this.advance();

        if (c === "(") this.addToken(TokenType.LEFT_PAREN, null);
        else if (c === ")") this.addToken(TokenType.RIGHT_PAREN, null);
        else if (c === "{") this.addToken(TokenType.LEFT_BRACE, null);
        else if (c === "}") this.addToken(TokenType.RIGHT_BRACE, null);
        else if (c === ",") this.addToken(TokenType.COMMA, null);
        else if (c === ".") this.addToken(TokenType.DOT, null);
        else if (c === "-") this.addToken(TokenType.MINUS, null);
        else if (c === "+") this.addToken(TokenType.PLUS, null);
        else if (c === ";") this.addToken(TokenType.SEMICOLON, null);
        else if (c === "*") this.addToken(TokenType.STAR, null);

        else if (c === "!") (this.match("=")) 
            ? this.addToken(TokenType.BANG_EQUAL, null)
            : this.addToken(TokenType.BANG, null);
        else if (c === "=") (this.match("=")) 
            ? this.addToken(TokenType.EQUAL_EQUAL, null)
            : this.addToken(TokenType.EQUAL, null);
        else if (c === "<") (this.match("=")) 
            ? this.addToken(TokenType.LESS_EQUAL, null)
            : this.addToken(TokenType.LESS, null);
        else if (c === ">") (this.match("=")) 
            ? this.addToken(TokenType.GREATER_EQUAL, null)
            : this.addToken(TokenType.GREATER, null);

        else if (c === "|" && this.match("|")) this.addToken(TokenType.OR, null)
        else if (c === "&" && this.match("&")) this.addToken(TokenType.AND, null)

        else if (c === "/") {
            if (this.match("/")) {
                while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
            } else this.addToken(TokenType.SLASH, null);

        } else if (c === " ") null; 
        else if (c === "\r") null;
        else if (c === "\t") null;
        else if (c === "\n") this.line++;

        else if (c === '"') this.string();
        else {
            if(this.isDigit(c)) {
                this.number();
            } else if (this.isAlpha(c)) {
                this.identifier();
            } else {
                this.lox.error(this.line, "Unexpected character.");
            }
        }
    }

}

export {
    Scanner 
};
