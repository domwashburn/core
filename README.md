# CORE
#### `{ 'code is the medium' }`

Core is a front end framework meant to get my projects up and running as smoothly as possible. Removing the pain of this setup will allow me, and hopefully others, to focus on important design and develpment concerns.

The goal of this css is to be as unopinionated as possoble. That being said, there are a few stylistic decisions that I've made to make using this as easy as possible.

### BEM Syntax
Why BEM you ask? Good question!
If you're unfamiliar with BEM, it stands for **B**lock, **E**lement, **M**odifier.

The BEM methodology, while verbose, is intended to be quickly readable by a developer and helps to write self commenting code.

You'll find that I make use of a SASS capability `@at-root`. This aids in writing a DRY sass file that renders flat and intentionally cascading CSS. It takes the rule defined after it and renders it as if it were top level of your SASS file

*example*

~~~scss
  .foo {
    &--bar1 {
      color: #BADA55;
    }
    @at-root &--bar-2 {
      color: #BADA55;
    }
  }
~~~

*would compile to*

~~~scss
  .foo .foo--bar1 {
      color: #BADA55;
    }
    
  .foo--bar-2 {
      color: #BADA55;
    }
~~~

## CORE typography:

- scale:
- vertical rhythm: 

_created by: Dominick Washburn || domwashburn@gmail.com_
