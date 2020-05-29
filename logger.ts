import * as Colors from 'https://deno.land/std/fmt/colors.ts';

const PLAYER_ID_COLOR_MAP = new Map<number, Function>([
  [1, Colors.blue],
  [2, Colors.magenta],
  [3, Colors.green],
  [4, Colors.yellow],
]);


export default class Logger {

  static logPlayerTable(text: string[], playerId: number) {
    const color = PLAYER_ID_COLOR_MAP.get(playerId) || Colors.white;
    console.table(text);
  }

  static logPlayer(text: string, playerId: number) {
    const color = PLAYER_ID_COLOR_MAP.get(playerId);
    Logger.logColor(text, color);
  };

  static logColor(text: string, color?: Function) {
    color = color ?? Colors.white;
    console.log(color(text));
  };

}
