from flask import Flask
from flask_socketio import SocketIO, emit, join_room
import Game


class wrapInt:
    def __init__(self, n: int):
        self.a = n

    def inc(self):
        self.a += 1

    def get(self):
        return self.a

    def reset(self):
        self.a = 0

# 非同期処理に使用するライブラリの指定
# `threading`, `eventlet`, `gevent`から選択可能


async_mode = None
ID: dict = {}

# Flaskオブジェクトを生成し、セッション情報暗号化のキーを指定
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

# Flaskオブジェクト、async_modeを指定して、SocketIOサーバオブジェクトを生成
socketio = SocketIO(app, async_mode=async_mode)

# スレッドを格納するためのグローバル変数
thread = None

table_number = wrapInt(0)  # 卓番号
num = wrapInt(0)  # 卓内内番号
g = Game.Game()
game_list = [g]


@socketio.on('my_event', namespace='/websocket')
def test_connect(data):
    print("connect!")
    print(data["data"])
    emit('my response', {'data': 'Connected', 'count': 0})


@socketio.on('connect', namespace='/websocket')
def con_connect():
    print("connect")
    #if num.count() == 2:
    #    num.inc()
    #    num.reset()
    #num.count_up()
    #print(num.get())
    #join_room(str(num.get()))
    #emit('my response', {'data': str(num.get())}, room=str(num.get()))


def get_keys_from_value(d: dict, val, key: str):
    return [k for k, v in d.items() if v == val and key != k]


def judge(number: int):
    if len(game_list[number].player[0].deck.card_list) == 0:
        emit("fin", 0)
    elif len(game_list[number].player[1].deck.card_list) == 0:
        emit("fin", 0)
    else:
        emit("de", [len(game_list[number].player[0].deck),
                    len(game_list[number].player[1].deck)])


@socketio.on("login", namespace="/websocket")
def login(data):
    if num.get() == 2:
        num.reset()
        table_number.inc()  # ゲーム番号のインクリメント
        game_list.append(g)  # 二人入るごとにGameインスタンスを生成

    join_room(data["name"])  # 送られたログインIDで部屋を作る
    ID[data["name"]] = table_number.get()  # IDにゲーム番号を入れる

    if num.get() == 0:
        emit("login", {"value": "Welcome Black Poker!!"}, room=data["name"])
        game_list[table_number.get()].p_name0 = data["name"]
    elif num.get() == 1:
        emit("login", {"value": "Welcome Black Poker!!"}, room=data["name"])
        game_list[table_number.get()].p_name1 = data["name"]
        game_list[table_number.get()].first_step(game_list[table_number.get()].p_name0, data["name"])

        game_num = ID[data["name"]]                                  # ゲーム番号を取得
        room_name = get_keys_from_value(ID, game_num, data["name"])  # dictionary内を検索
        emit("start", room=data["name"])
        emit("start", room=room_name[0])
        if game_list[ID[data["name"]]].turn_player == 1:
            emit("myTurn", room=data["name"])
        else:
            emit("myTurn", room=data["name"])
            emit("myTurn", room=room_name[0])
    else:
        emit("login", {"value": "No vacancy!"}, room=data["name"])
    num.inc()


@socketio.on("situation", namespace="/websocket")
def situation(data):
    game_num = ID[data["name"]]
    print(game_list[game_num].player[0].hand.card_list)
    print(game_list[game_num].player[1].hand.card_list)
    emit("situation", {"user_1": {"id": game_list[game_num].p_name0,
                                  "name": game_list[game_num].p_name0,
                                  "hand": game_list[game_num].player[0].hand.card_list},
                       "user_2": {"id": game_list[game_num].p_name1,
                                  "name": game_list[game_num].p_name1,
                                  "hand": game_list[game_num].player[1].hand.card_list}
                       }, room=data["name"])
    """
    emit("situation", {"user_1": {"id": game_list[game_num].p_name0,
                                  "name": game_list[game_num].p_name0,
                                  "hand": game_list[game_num].player[0].hand.card_list,
                                  "deck": game_list[game_num].player[0].deck.card_list,
                                  "cemetery": game_list[game_num].player[0].cemetery.card_list,
                                  "barrier": [],
                                  "soldier": []},
                       "user_2": {"id": game_list[game_num].p_name1,
                                  "name": game_list[game_num].p_name1,
                                  "hand": game_list[game_num].player[1].hand.card_list,
                                  "deck": game_list[game_num].player[1].deck.card_list,
                                  "cemetery": game_list[game_num].player[1].cemetery.card_list,
                                  "barrier": [],
                                  "soldier": []}
                       }, room=data["name"])
    """
    print("c")


@socketio.on("turnEnd", namespace="/websocket")
def turn_end(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])
    game_list[game_num].end()
    emit("turnEnd", room=data["name"])
    emit("turnEnd", room=room_name)
    game_list[game_num].starting()
    game_list[game_num].draw()
    emit("draw", room=data["name"])
    emit("draw", room=room_name)
    judge(game_num)


@socketio.on("setBarrier", namespace="/websocket")
def set_barrier(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])
    emit("setBarrier",
         {"card": game_list[game_num].player[game_list[game_num].turnPlayer].hand.card_list[data["handLength"]]},
         room=data["name"])
    emit("setBarrier",
         {"card": game_list[game_num].player[game_list[game_num].turnPlayer].hand.card_list[data["handLength"]]},
         room=room_name)
    emit("damage", 1, room=data["name"])
    emit("damage", 1, room=room_name)



@socketio.on("summon", namespace="/websocket")
def summon(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])
    emit("summon",
         {"card": game_list[game_num].player[game_list[game_num].turn_player].hand.card_list[data["handLength"]]},
         room=data["name"])
    emit("summon",
         {"card": game_list[game_num].player[game_list[game_num].turn_player].hand.card_list[data["handLength"]]},
         room=room_name)
    if data["costLength"] is not None:
        game_list[game_num].summon_magician(data["handLength"], data["costLength"], data["barrierLength"])
        emit("driveBarrier", data["barrierLength"], room=data["name"])
        emit("driveBarrier", data["barrierLength"], room=room_name)
        emit("handDecrease", {"len": data["costLength"]}, room=data["name"])
        emit("handDecrease", {"len": data["costLength"]}, room=room_name)
    elif data["barrierLength"] is not None:
        if len(data["barrierLength"]) == 2:
            game_list[game_num].summon_hero(data["handLength"], data["barrierLength"][0], data["barrierLength"][1])
            emit("driveBarrier", data)




socketio.run(app, debug=True)

