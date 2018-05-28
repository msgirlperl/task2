## Assumptions I've made that seemed silly to bother anyone with
-When a line is selected and you click 'draw line', the line should be un-selected
-Move should only work when the left-mouse button is held down
-During "Pencil Mode", drawing on the canvas stops when you leave the canvas but if your mouse button is still down, it should draw again when you re-enter the canvas
-If you are in "Move Mode" and select an object, and then click on "Select Mode", it leaves the given object selected.
-The original implementation I downloaded didn't actually meet this requirement: Erase: the user can erase a line by clicking within 10 pixels of it.
  --> It only erased the closest line, but didn't take into account the 10 pixel constraint.  I've left it like that, but implemented the Select button to adhere to this constraint.

## Requirements Notes

#### Support moving lines

-I added a message in the toolbar when the user attempts to move outside the canvas area.
-The object will stop moving when you lift your mouse while inside the canvas area.
-There's some potentially undesirable behavior where if you drag the mouse outside of the canvas area and lift the mouse, and then return to the canvas area, the object continues to move.  This is because the mouseup event is attached
to the canvas, not a parent element or the window.  I wasn't sure whether it made more sense to have the object move again when re-entering the canvas or to require the user to re-instigate the move.  I tried both and both felt a little awkward to me.

## Highlights of a few code review changes:
-length does not need to be passed into the Line constructor function as it is calculated anyway.  That being said, it doesn't appear to be used anywhere, so I've removed the length property altogether
-no need to set var self= this because "this" is set to the app object which is what we want (it is useful to set self = this when we're in a nested function but this is not the case; in some cases where we ARE in a nested function, I've switched to arrow functions to preserve the lexical 'this')
-It's a good idea to use squaredDistance instead of distance as a performance optimization when comparing closest points but it's worth a comment because it doesn't immediately seem intuitive
-I pulled some frequently-used expressions into their own functions
-Rather than use a bool to determine if we're in eraseMode, I'm using a pseudo-enum so that it can accommodate more modes and is extensible
-Added some comments
-changed app.js to use an immediately invoked object literal to keep the methods private
