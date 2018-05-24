# Take-home assignment #2

In this assignment, you will be working on an existing canvas-based drawing application.

In its current state, the application supports a toolbar, with 2 modes:
- _Line_: the user can draw a line by clicking at 2 positions on the canvas,
- _Erase_: the user can erase a line by clicking within 10 pixels of it.

We have 3 new requirements for this drawing application. You should read all the requirements first, but we recommend you to work on them in order.

General guidelines:
- You may not use any external JS libraries.
- You may fix any issue that you would point out during code review and ask another developer to fix. This includes general best practices, poor design patterns, etc.
  - We are not expecting a complete refactoring, so for example, you should not have to rewrite everything in ES6.
  - You do not need to change app.css/index.html besides adding more scripts to load and commenting/uncommenting html for buttons in the toolbar.
- Browser support
  - You just need to support Google Chrome here. If you do not have access to Chrome, please mention which browser you tested your code on.
  - There is no expectation to support touch devices.

## New requirements

### 1. Make deletion more deterministic

As is, the _Erase_ mode can make it hard for the user to pick the right line, because if several lines are within 10 pixels of the clicking point, then it is easy to delete the wrong line.

To solve this, we want to revamp how deletion works.

Requirements:
- Add a new _Select_ button to the toolbar
  - When a line is selected, its ends should show as small circles to provide feedback on the which line is selected.
  - If several lines are within 10 pixels of the clicking point, the closest line should be selected.
  - If no line is within 10 pixels of the clicking point, no line should be selected, and any currently selected line should be de-selected.
- Clicking on the _Erase_ button should simply delete the currently selected line and leave the user in _Select_ mode with no line selected.

### 2. Add new _Pencil_ mode

To provide a second option to draw, we want to add a new _Pencil_ mode.

Requirements:
- Add a new _Pencil_ button to the toolbar.
- In this mode, the user can draw by holding down the left button of their mouse and moving it over the canvas. When the mouse button is released or the mouse leaves the canvas, drawing should stop.
- The drawn object is a series of connected lines to approximate the path of the mouse, with a new segment being added on every mousemove event.
- In _Select_ mode, the full object becomes selected and can be deleted.

### 3. Support moving lines

Lastly, users have asked to be able to move existing objects.

Requirements:
- Add a new _Move_ button to the toolbar.
- In this mode, the closest object within 10 pixels should become selected when you mouse down to start dragging it.
- Only the whole object can be moved, not points or segments from the _Pencil_ mode.
- No part of any line can leave the canvas while moving. This constraint should be implemented in a user-friendly way, including when the mouse leaves the canvas.
