// ==UserScript==
// @name         garyc-me-autodrawer
// @namespace    GarycMeAutodrawer
// @version      0.1
// @description  Allows to attach a file that will be drawn automatically
// @author       thepicture
// @match        https://garyc.me/sketch/
// @require      https://code.jquery.com/jquery-3.6.3.min.js
// @require      https://raw.githubusercontent.com/wangpengfeido/image-to-ascii-art/master/dist/image-to-ascii-art.min.js
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  "use strict";
  const window = unsafeWindow;

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const BLACK_PIXEL = "1";
  const WHITE_PIXEL = "0";

  let BLACK_PIXEL_THRESHOLD = 236;

  let INTERVAL_BETWEEN_PIXELS_X = 2;
  let INTERVAL_BETWEEN_PIXELS_Y = 2;

  const PIXEL_LIMIT = 5 * 10 ** 11;

  const MARKUP = `
        <tr>
            <td><input type="file" class="file-to-autodraw"></td>
            <td><input type="numeric" maxlength="3" autocomplete="off" placeholder="Black pixel threshold" class="black-pixel-threshold"></td>
            <td><input type="text" maxlength="3" autocomplete="off" placeholder="Interval between pixels, X" class="interval-between-pixels-x"></td>
            <td><input type="text" maxlength="3" autocomplete="off" placeholder="Interval between pixels, Y" class="interval-between-pixels-y"></td>
        </tr>
        `;

  const onPointerDown = (x, y) => {
    window.pressing = true;
    window.starting = true;

    window.lastX = Math.floor(x);
    window.lastY = Math.floor(y);
    window.oldx = -1;
    window.update();

    window.moved = false;
  };

  const onPointerMove = (x, y) => {
    window.lastX = Math.floor(x);
    window.lastY = Math.floor(y);

    window.lastX = Math.min(Math.max(window.lastX, 0), CANVAS_WIDTH);
    window.lastY = Math.min(Math.max(window.lastY, 0), CANVAS_HEIGHT);
  };

  const onPointerUp = () => {
    if (!window.moved) {
      window.lastX += 3;
      window.update();
    }

    window.pressing = false;
    window.dat += " ";
    window.clearSelection();
  };

  const drawPixel = (x, y, isBlackPixel) => {
    if (!isBlackPixel) {
      window.lastX = Math.floor(x);
      window.lastY = Math.floor(y);

      return;
    }

    onPointerDown(x, y);

    onPointerMove(x, y);

    onPointerUp(x, y);
  };

  const draw = async (file) => {
    return await new Promise((resolve) => {
      const url = URL.createObjectURL(file);

      const img = new Image();

      img.addEventListener("load", () => {
        const { width: imageWidth, height: imageHeight } = img;

        const config = {
          drawWidth: CANVAS_WIDTH / imageWidth,
          drawHeight: CANVAS_HEIGHT / imageHeight,
          greyRangeChar: [
            { from: 0, to: BLACK_PIXEL_THRESHOLD - 1, char: WHITE_PIXEL },
            { from: BLACK_PIXEL_THRESHOLD, to: 255, char: BLACK_PIXEL },
          ],
        };

        const imageToAsciiArt = new ImageToAsciiArt({
          config,
        });

        const initialX = Math.floor(
          imageWidth < CANVAS_WIDTH ? (CANVAS_WIDTH - imageWidth) / 2 : 0
        );
        const initialY = Math.floor(
          imageHeight < CANVAS_HEIGHT ? (CANVAS_HEIGHT - imageHeight) / 2 : 0
        );

        imageToAsciiArt.convert(img).then(async (ascii) => {
          const matrix = ascii.split("\n").map((row) => row.split(""));

          const flattenMatrix = matrix.flat();

          const countOfBlackPixels = flattenMatrix.filter(
            (character) => character === BLACK_PIXEL
          ).length;

          const areMoreBlackPixelsThanWhite =
            countOfBlackPixels > ascii.length / 2;

          for (
            let i = initialX;
            i < CANVAS_WIDTH;
            i += INTERVAL_BETWEEN_PIXELS_X
          ) {
            for (
              let j = initialY;
              j < CANVAS_HEIGHT;
              j += INTERVAL_BETWEEN_PIXELS_Y
            ) {
              const row = matrix[j - initialY];
              const column = row && row[i - initialX];

              const rowAsNumber = parseInt(row);
              const columnAsNumber = parseInt(column);

              if ([rowAsNumber, columnAsNumber].some(isNaN)) {
                continue;
              }

              const isBlackPixel = areMoreBlackPixelsThanWhite
                ? !columnAsNumber
                : columnAsNumber;

              drawPixel(i, j, isBlackPixel);
            }
            await new Promise((resolve) => setTimeout(resolve));
          }
        });

        imageToAsciiArt.destroy();

        URL.revokeObjectURL(img.src);
        img.remove();

        resolve();
      });

      img.src = url;
    });
  };

  const onFileSelect = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    const threshold = $(".black-pixel-threshold").val();

    if (threshold) {
      BLACK_PIXEL_THRESHOLD = Number(threshold);
    }

    const intervalBetweenPixelsX = $(".interval-between-pixels-x").val();

    if (intervalBetweenPixelsX) {
      INTERVAL_BETWEEN_PIXELS_X = Number(intervalBetweenPixelsX);
    }

    const intervalBetweenPixelsY = $(".interval-between-pixels-y").val();

    if (intervalBetweenPixelsY) {
      INTERVAL_BETWEEN_PIXELS_Y = Number(intervalBetweenPixelsY);
    }

    await draw(file);
  };

  const resetFile = () => {
    $(".file-to-autodraw").val("");
  };

  const initializeMarkup = () => {
    $("table").width("auto");

    $("tbody").append(MARKUP);

    $(".file-to-autodraw").on("change", onFileSelect);

    $("#reset").on("click", resetFile);
  };

  initializeMarkup();
})();
