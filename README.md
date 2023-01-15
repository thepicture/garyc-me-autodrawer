# garyc-me-autodrawer

Allows the user to draw an image automatically on [garyc.me/sketch](https://garyc.me/sketch) by attaching an image file.

## Dependencies

- JQuery 3.6.3
- [image-to-ascii-art](https://github.com/wangpengfeido/image-to-ascii-art)

## Requirements

- TamperMonkey v4.18.1 or higher

## Installation

1. Press the TamperMonkey icon in the addon list.
2. Press the "Create a new script..." button.
3. Copy the contents of `index.user.js` file into the field.
4. Save the script.
5. Reload the garyc.me site.

## How To Use

1. Configure, if needed, the variables:

- Black pixel threshold. Pattern: `[0-9]{3}`. Determines whether the program should draw a black pixel. If not presented, then `254` is used. Should be in range `0-254`.
- Interval between pixels, X. Determines the spacing between each pixel for horizontal axis. The bigger the value, the more pixelated the result and the less ink is used. if not presented, `2` is used. Should be a positive integer greater than 1.
- Interval between pixels, Y. Determines the spacing between each pixel for vertical axis. The bigger the value, the more pixelated the result and the less ink is used. if not presented, `2` is used. Should be a positive integer greater than 1.

2. Interact with the "Choose File" input to select a file.
3. If the result is not desired (for example, if ink limit is lost), use the `reset` button, configure the variables and try again.
