import { Token } from "./tokentype";
import { RuntimeError } from "./interpreter";

class Environment {
    enclosing :Environment | null = null;
    map = new Map();

    constructor(enclosing :Environment | null = null) {
        this.enclosing = enclosing;
    }

    define(name :string, value :any) :void {
        this.map.set(name, value);
    }

    get(name :Token) :any {
        if(this.map.has(name.lexeme)) {
            return this.map.get(name.lexeme);
        }

        if(this.enclosing !== null) return this.enclosing.get(name);

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    ancestor(distance: Number) :Environment {
        let environment :Environment = this;
        for(let i=0;i <distance;i++) {
            if(environment.enclosing === null) {
                throw new Error("Resolving went too far.");
            }
            environment = environment.enclosing;
        }

        return environment;
    }

    getAt(distance :Number, name :string) {
        return this.ancestor(distance).map.get(name);
    }

    assign(name: Token, value: any) {
        if(this.map.has(name.lexeme)) {
            this.map.set(name.lexeme, value);
            return;
        }

        if(this.enclosing !== null) {
            this.enclosing.assign(name, value);
            return
        }

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    assignAt(distance :Number, name:Token, value: any) {
        this.ancestor(distance).map.set(name.lexeme, value);
    }
}

export {
    Environment
}
