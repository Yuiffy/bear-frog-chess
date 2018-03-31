/**
 * Created by yuiff on 2018/3/31.
 */
const findChessPos = (board, chessId) => {
    let selectPos = {};
    for (let i = 0; i < board.length; i++) {
        const row = board[i];
        for (let j = 0; j < row.length; j++) {
            // console.log(typeof(i), typeof(j));
            const item = row[j];
            if (item.id === chessId) {
                selectPos = {
                    x: i,
                    y: j
                };
                break;
            }
        }
    }
    // console.log(selectPos, chessId, board, typeof(selectPos.x), typeof(selectPos.y));
    return selectPos;
}
export {findChessPos}