# Crafting Interpretors with TypeScript

This is just a stream of consciousness as I worked through the first half of 
Crafting Interpreters using TypeScript.

It is a great book and I recommend it whole heartedly!

http://craftinginterpreters.com/

I'm going to try following this book using javascript, specifically typescript.
I don't think it'll be too bad because I am familar with typescript and I should
be able to at least port over the logic. 

After working through the scanner it is actually amazing how much of the code is
similar to Java which the book follows. This may be because they are both
derived from C or it could be that the java in JAVAscript is really coming out
now. I didn't notice before that Java is very similar. I could have done it in
Java but oh well. For the most part you should be able to just use the examples
to write it in Typescript.

I wrote the Abstract Syntax Tree classes and this was really simple. The book
wrote a script to do it but I wasn't sure what I was making so I did it by hand.
I also learned about Interfaces and the Visitor paradigm this chapter.
Interfaces are okay, they seem to be sort of contract enforced and I think it
could be skipped maybe. But the Visitor paradigm is very cooool. I really like
working out the logic and tracing out what its doing and looking at it now, it
is a very clean way of implementing the ASTPrinter class. All the print logic is
one place and this also means any future methods needs to only go in method
specific class. It's a strange differention but I could see it being useful in
the future. The tree structure comes from the fact that the AST classes all take
in more Expr type in their nodes which is very cool. Literal is a terminal
node. I don't fully see it as a tree but it definitely is. Just not intuitive.

As I work through this the vim addon YouCompleteMe is so friggin useful and
Typescript is also. i was surprised that the code I was writing was working so
far without me having to run it and I finally figured it out. The book is
fantastic but doing a straight copy and paste should have caused me all sorts of
issues. The reason I was able to write so much without really having to run it
to test it is because my editor was throwing red flags. Stuff that was coming
later down in a chapter would cause red highlights for errors and I would stub
things out. Being able to match types and make sure what I was trying to pass in
and out of methods was termendously helpful. I imagine this in pure javascript
would be quite an experience!

Learned how to do exception handling and how to create my Error classes and how
to catch them. Very neat and very helpful for debugging.

# Scanning

Very cool! I really liked this and it really got at what I thought happed. The
scanner goes character by character and it does a giant case statement to create
tokens for all the things it sees. Whats cool is the advance method and peek
method and how characters are consumed. Alot of really cool logic where it is
very simple looking at it but I went about it the wrong way before. Really smart
that i followed the book instead of doing my own thing as it became clear why
certain things were done the way they are. One example is the isAtEnd function
that I was going to skip and inline the check, however what I didn't know was
that this function is used everywhere. Advance method is so wonderful. I learned
alot about tokenizing in this chapter 

# Abstract Syntax Tree

Very cool. Very simple and implements the visitor paradigm which is pretty neat
and its somethign I can see being useful. It is pretty clear how they are trees
and the work I did with trees just last week are already coming into play. i
don't intuively see the AST as trees unfortunately, I keep expecting it to be
more intutive but I think I just need to let it sit. I am starting to see the
recursive nature of it and the building blocks of traversing it.

# Parsing

This uses alot of the core logic of the advance, peek, isAtEnd functionality to
go through the tokens. Very cool. I really liked that. The big different is the
way the tree gets built and how the precdence rules are encoded. it's actually
very cool and I feel like I'm close to understand it. When it first starts, it
passes everything to the general case and from there it gets more and more
specific or moves up the precedence chart. This means that by layering the
function calls within each other then you can automatically get precdence rather
than  whatever the hell I did when I was trying to do stuff like this. The
coolest part was grouping where once you hit a ( you trigger a grouping and
build a brand new expression. Everythings a tree but this is even more tree.

Syntax errors are cool, once it hits an invalid case, the parser works its way
back up and discards enough tokens to get it back to a point where it can
continue parsing. Very neat.

Very fucking cool. I got the parser working with expressions and its very neat.
It is very clear what the ensted functions are doing. First thing it does is
goes and find all the low end stuff such as picking up addition then it looks
for multiplication and on and this builds up a tree and its very clear lisp
style. Mind blowing stuff. Fuck.

I want to do the challenges but they may be a touch out of my reach. I also
think the ternary operator would be easier once I can test my code. A big
difference in the way the book is laid out is that never does he run the code. I
would run and debug as I go through but in this case he seems to have a map that
we are following. it's neat but It does require me to sort of run it and
mentally run through things to see whats happening. I'm pretty happy that I can
mentally run through the scanner and parsing logic.

# Evaluating

Fuuuucck. This was a cool chapter, not as heavy as the scanning or parsing. This
chapter was actually pretty easy compared to the previous two. This was all
about evaluating stuff and it went smoothly. There are probably some issues with
the fact that I'm using javascript but so far everything is still holding and
working the way I and I think the book expects. What's crazy is I have a fully
working calculator now! However now I don't fully grasp what's happening. i
think I need ruminate on this for awhile before it all makes sense. I'm happy I
have something though. Very happy. Very neat. Scanning -> AST -> Parsing ->
Evaluating

Multiline source isn't working and I'm not sure why. The coolest thing is being
able to debug the language. I got multiline files working. I needed to loop
around the parser to have it go all the way to the end of the tokens. Very
coool. Had a minor bug with quotations where the last one was missing. Had a
typo I think in my slice. Adding strings is wrong. Had to slice the trailing
quotation on the left and the leading quotation on the right.

Implemented challenge 2 where I added in support for "test" + 3 = "test3". Very
neat. I can't seem to generalize it to javascript quite yet. I logically get it
but I think i have disconnect between the AST class and the visitor class,
really i should think of the AST as containing the interpreter code and I think
that make it more clear. When i ask the ast to interpret it then goes in and
finds that it has 2 nodes on it, one is a string and the other is a number. it
them smoshes them together and gives me a string back, this is the evaluation. I
wonder if javascript does the same thing.

Divide by 0 works and spits out Infinity. Which is cool. This is javascripts
return;

# Statements

Wired up the print statement and plain expression. Very friggin cool. What's
amazing is that it works without running the code constantly which is still a
very new and different way to develop. Not sure how I feel about it.
Unfortunately it broke my repl and now I need a print statement to get my repl
to work and semicolons to end things off or throws an error. I think i want to
fix that before I move to variables but this is already shaping up quite a bit.
It's not fair. i don't intuit it enough. But is it so cool. I kind of want to do
this with BASIC and make a repl. That could be so fucknig cool.

I added in a isrepl variable to the interpreter and now it will let me skip
semicolons and output expressions in the repl. Very cool to be messing with the
guys of the language and its so easy.

## Variables

```js
    assignment() :Expr {
        const expr: Expr = this.equality();

        if(this.match(TokenType.EQUAL)) {
            let equals :Token = this.previous();
            const value :Expr = this.assignment();

            if(expr instanceof Variable) {
                const name :Token = expr.name;
                return new Assign(name, value);
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expr;
    }
```

Very fucking cool. The first line of this function basically begins processing,
during assignment this will fall through to the button and get IDENTIFIER token
type and will return back a new variable class object. We thenn check if the
next token is an equals, if it is we are going to evaluate the right hand side,
this.assignment could be this.expression because it needs to read in the next
token. If the expr was indeed a variable type then it will do the assignment. If
it wasnt equals as the next token then it treaks the identifier as an expression
which will go and retrieve the expression from the environment through the
Variable class and through the visitVariable method it will reach the
environment.

Mind blowing. I have implemented global variables. It is pretty big and I can't
keep everything in my head but I'm happy with it so far. Very neat and I imagine
hacking away it will eventually make things a bit more clear and obvious.
Amazing. The best part is that I was mentally running the code and it didn't
make sense, something wasn't quite adding up and I figured out that there was a
bug. I then checked the book again and found that indeeed, I had forgotten a
crucial step in the assignment logic and that was causing me issues. This book
is definitely testing my thinking.

## Scope

A linked list of environments fuuuuck. Environments point to their parents and
assignment and and shadowing of variables is innate to the structure of walking
up the tree. Very cool and very nice.

Scopes were simpler to implement and damn is it a function of its structure.
Very neat. I really wish i could come up with this on my own.

Lol the challenge in this chapter was to get the repl working again. That makes
me feel good.

# Control Flow

Implementing Ifs was straighforward there is a pattern to adding stuff to the
language. First is to create the AST class, then in the parser we implement the
the AST builder function as part of the chain that alreadt exists. In the
interpreter we need to implement the visit method to evaluate the AST. Very 
simple but very powerful. And Simple! 

I fixed a bug where I wasn't making tokens for the || and &&. Very nice to be
able to debug effectively and I think I have some inkling of whats going on
under the hood. The best part is that I took a quick glance at Go and I was
thinking of it interms of what I learned. They didn't have the semicolons. i
tried to screw around with the number of parameters going into functions and
such. Very cool. Strange thing about Lox seems to be 0 is not falsey beucae only
null and false are falsey. I may change this.

Implemented the while was dead easy now that I can see the pattern. and I can
read the grammer diagrams i think. I ended up implementing while myself and it
matched up with the book which is to say that the book is really good at making
this all simple and intutive enough that I can feel myself around. It has a
really good structure for learning I think.

Brilliant. I got for loops working in terms of while and it's pretty cool. I ran
into a bug with having my greater and less than signs mixed up but it was quick
to find and fix. The repl is very helpful because I test aspects of the language
quickly.

I know the answers to the challenges because of the SICP class which is very
nice. With first class functions and dispatch you can use use functions to
evaluate true and false and pass those as keywords to dispatch. So you would
write an IF function that dispatches 2 functions passed on some boolean. Loops
can be recreated using recursion and base cases. The big thing I'd like to add
is i++. That would be so cool. That and the ternary operator.

# Functions

Relatively straight to get the parsing done. Interpret is far more work. Still
simple but it does require thinking and fudging things as Java is different from
Typescript in the way interfaces work. But I'm getting it done slowly. I'm gonig
to be pretty excited if this actually works as I have no idea what I'm doing
with the interfaces and just going with my gut.

There are 2 halves to functions, there is the implementation part where we set
up the parser to handle () and make function calls. The second part is the
defining of functions by doing function name.

Functions are a helluva flow. Lets see if i can get this out. So when we first
process a lox file it tokenises everything and so it take a function declaration
and creates the AST for it and also adds it to the environment. Next when we
tokenize the rest of the script any calls to a function will count as a
variable, this means that when we go to evaluate it it will go into
VisitVariable and come out with a function instead. This will then spin into the
Call AST which will call visitCall() which will then execute the function ast
from before except it will be ina brand new environment. This very much the
ouroboros. Very fucking cool.

In the scanner we split up every so function, name, (, args, ) then in the ast
we build up an AST for the function declaration by matching against the function
keyword. We then also process all way to an ending left brace. With this we
create an entry in the environment. Next time we see name() we can then.

Incorrect! The Call AST triggers right before the Variable one and that is what
causes it to be considered a call and triggers a visitCall in the future. So not
as Ouroboros but damn is confusing. But oh so cool.

I implemented i++ because that is way too useful in a for loop. There were 2
ways I could think but I couldn't figure out which was the correct or better
way. The first way was to add a DOUBLE_PLUS to the scanner and then parse it and
desugar it the same way as FOR and WHILE. The other way that feels easier was to
modify the addition method and check there if the next token was a an operator.
If it was then I just desugar it right then and there and return a new Assign
object. This works. But I'm sure there could be all sorts of issues and bugs. I
think the first option might be the cleaner way but this is certainly the
quicker way. Or maybe not.

Wrote a fibonacci calculator using recursion and damn is it slow. Really slow! I
tried to use caching but I don't have objects yet. I don't have proof closure
works yet but this is pretty cool to be this far into a programming language.

# Scopes

Very cool bug with scopes and how binding variables introduces weird scoping
issues.
 
The example can be seen in the closure example.
```
  var a = "global";
{
    function showA() {
        print a;
    }

    showA();
    var a = "block";
    showA();
}
```
The answer then is to go through before hand an find all the variables. This is
called a variable resolution pass and is before the interpretation but after the
parsing. I don't quite understand it yet.

Mind isn't full in it because this kind of a boring chapter. It looks like it
has sommething to do with processing a stack of environments with varables
inside them.

All variables get setup during the resolver stage and we make a stack of scope
where each expr resides, we keep the distance from the global environment in a
map and we attach this map to the interpreter. When it looks up a variable it
will first check this map to find out how far it should go to find a variable.
This way in the closure above when it runs showA the second time, it will go to
look up a when printing and it will know that variable was bound in the global
space rather than looking at its immediate scope. It is a very cooool way to do
resolution. I need to think about it some more but it is clean. 

The resolver step is pretty neat but I need to walk through it more deeply. 

So we begin. Pass in the interpreter and run resolve(statements) against
everything that came back from the parser. At this point we have no scopes.
While running the statements, we have a few things that will trigger scope
creation, functions and blocks. These two things will add maps to form in a
stack and any variables declared inside those things will get added to those
maps. The ultimate goal of the resolver is to run resolveLocal on variables and
assignments so that the interpreter can write down, where in the stack those
variables came from. The interpreter holds this in the locals variable. Now when
it goes to get a variable value or do an assignment it will go to the locals
object with the expression it is looking up and it get the depth from it. once
it has the depth it will then go into the environment and travel up it to get
the correct value. The reason this works is that expression is really a
reference so when it looks up that reference it will find the depth for that
reference. AKA in the above snippet it runs showA. inside when it does the print
a it goes to find that a. The reference to this a is different from the
reference to a that comes after. the a that comes after would be a different
reference and it would have the environment as the block. The function's a
however would have an environment pointing to the global space.

The resolver is also semantic analysis and we can do stuff like checking for
variables being declared but not used and for incorrect return statements. Very
neat. Very boring.

# Classes

A class is a way to package data and the code that uses it and it is what
allowed people to write massive amounts of code. You have a constructor that
lets you build instances of that object, you have fields that hold data and you
have methods that act on those fields.

A class without method is just a map. Neat idea.

Very big. Debugged it and found abug in how I was checking for nulls and holy
cow was it a mess to debug. Didn't take me long but trying to juggle and walk
through the code was intense. I'm going to have to think. But damn is it cool.
Very cool how it works. Classes are magical. Everything kind of flowed but this
is something else.

The closest thing so far is how the keyword plays into all this. At this point
instances can't hold onto themselves and use their own fields. The keword this
is basically a way to reference itself but in a closure so it stays attached to
the instance.

Without a this, then methods inside can't access fields. this is variable
defined by the system when an instance is made. Amazing. Now methods will
trigger an extra environment that only contains this. Then each method will
build its own scope with the parent being the one with this in it. Pretty coll
and pretty neat. This happens in the resolver and this needs to happen in the
interpreter. When we go to get an instance of an object to run a method, the
interpreter needs to create an extra environment containing the this to do
everything properly.

Fucking magical. Fuck. It works.

A constructor basically looks for an init function to run and then binds it to
the instance and then calls that method immediately. If there is no init
function then there is no constructor! If there is an init then it will run
immediately. So I'm guessing even without a constructor we can duplicate it by
simply running a method at the beginning. We just need to remember.

Very stupid bug where I forgot to return the instance. Very brutal to debug a
programming language. Because i don't fully grasp it but I slowly made my way to
the error starting at the very beginning. Very fun and very frustrating because
I don't know where to start.

# Inheritance

Simple but very powerful. The way super methods are done are gorgeously simple
and very cool. The super keyword is similar to this but for an entire class.
Basically when a super is hit, it creates a closure where super will reference
the parent class imeddiately that way class chaining works as it should.

This and super are based on closures and that is so friggin cool. I kind of wish
there was no resolver bewcause a direct connection from parser to interpreter I
feel was better and more intuive. Thinking about it though the resolver is fine,
it does basically the same thing as the interpreter but only does the
environment building and calcualtes the number of steps it has to go.

# Conclusion

Very good book! I really enjoyed it. Overall I learned alot and I got really
comfortable with Typescript. 2100 lines of code whereas the book mentions 1k
lines. I'm not sure why mine is so bloated but could be the javascript. Either
way I'm pretty happy that I went through this first part and finished it. The
lexer and parser were probably the coolest and the ones I understand the most.
The resolver and interpreter are much harder to figure out. I wonder if the
visitor paradigm is the best way to do this. I think having the methods inside
their AST would make it more intuitive and easier to grasp mentally.
