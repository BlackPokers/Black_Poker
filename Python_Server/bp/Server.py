import json

import Game
from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from Card import card_to_json

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
g: Game = Game.Game()
game_list = [g]



@socketio.on('my_event', namespace='/websocket')
def test_connect(data):
    # print("connect!")
    # print(data["data"])
    emit('my response', {'data': 'Connected', 'count': 0})


@socketio.on('connect', namespace='/websocket')
def con_connect():
    pass
    # print("connect")
    #if num.count() == 2:
    #    num.inc()
    #    num.reset()
    #num.count_up()
    ## print(num.get())
    #join_room(str(num.get()))
    #emit('my response', {'data': str(num.get())}, room=str(num.get()))


def get_keys_from_value(d: dict, val, key: str):
    return [k for k, v in d.items() if v == val and key != k]


def judge(number: int, e_room:str, m_room:str):
    if len(game_list[number].player[0].deck.card_list) <= 0:
        emit("fin", 1, room=e_room)
        emit("fin", 1, room=m_room)
    elif len(game_list[number].player[1].deck.card_list) <= 0:
        emit("fin", 0, room=e_room)
        emit("fin", 0, room=m_room)


def situationF5(m_room: str, e_room: str):
    game_num = ID[m_room]
    d = {
        "user_1": {"id": game_list[game_num].p_name0,
                   "name": game_list[game_num].p_name0,
                   "hand": card_to_json(game_list[game_num].player[0].hand.card_list),
                   "deck": card_to_json(game_list[game_num].player[0].deck.card_list),
                   "cemetery": card_to_json(game_list[game_num].player[0].cemetery.card_list),
                   "barrier": card_to_json(game_list[game_num].player[0].field.barrier),
                   "soldier": card_to_json(game_list[game_num].player[0].field.soldier)},
        "user_2": {"id": game_list[game_num].p_name1,
                   "name": game_list[game_num].p_name1,
                   "hand": card_to_json(game_list[game_num].player[1].hand.card_list),
                   "deck": card_to_json(game_list[game_num].player[1].deck.card_list),
                   "cemetery": card_to_json(game_list[game_num].player[1].cemetery.card_list),
                   "barrier": card_to_json(game_list[game_num].player[1].field.barrier),
                   "soldier": card_to_json(game_list[game_num].player[1].field.soldier)}
    }

    emit("situation", d, room=e_room)


@socketio.on("login", namespace="/websocket")
def login(data):
    if num.get() == 2:
        num.reset()
        table_number.inc()  # ゲーム番号のインクリメント
        game_list.append(Game.Game())  # 二人入るごとにGameインスタンスを生成

    join_room(data["name"])  # 送られたログインIDで部屋を作る
    ID[data["name"]] = table_number.get()  # IDにゲーム番号を入れる

    if num.get() == 0:
        emit("login", {"value": "Welcome Black Poker!"}, room=data["name"])
        game_list[table_number.get()].p_name0 = data["name"]
    elif num.get() == 1:
        emit("login", {"value": "Welcome Black Poker!"}, room=data["name"])
        game_list[table_number.get()].p_name1 = data["name"]
        game_list[table_number.get()].first_step()

        game_num = ID[data["name"]]                                  # ゲーム番号を取得
        room_name = get_keys_from_value(ID, game_num, data["name"])[0]  # dictionary内を検索
        emit("start", room=data["name"])
        emit("start", room=room_name)
        if game_list[ID[data["name"]]].turn_player == num.get():
            emit("myTurn", {"bool": True}, room=data["name"])
        else:
            emit("myTurn", {"bool": True}, room=room_name)
    else:
        emit("login", {"value": "No vacancy!"}, room=data["name"])
    num.inc()


@socketio.on("situation", namespace="/websocket")
def situation(data):
    game_num = ID[data["name"]]
    # print(game_list[game_num].p_name0)
    # print(game_list[game_num].p_name1)
    emit("situation", {"user_1": {"id": game_list[game_num].p_name0,
                                  "name": game_list[game_num].p_name0,
                                  "hand": card_to_json(game_list[game_num].player[0].hand.card_list),
                                  "deck": card_to_json(game_list[game_num].player[0].deck.card_list),
                                  "cemetery": card_to_json(game_list[game_num].player[0].cemetery.card_list),
                                  "barrier": [],
                                  "soldier": []},
                       "user_2": {"id": game_list[game_num].p_name1,
                                  "name": game_list[game_num].p_name1,
                                  "hand": card_to_json(game_list[game_num].player[1].hand.card_list),
                                  "deck": card_to_json(game_list[game_num].player[1].deck.card_list),
                                  "cemetery": card_to_json(game_list[game_num].player[1].cemetery.card_list),
                                  "barrier": [],
                                  "soldier": []}
                       }, room=data["name"])

    # print("c")


@socketio.on("turnEnd", namespace="/websocket")
def turn_end(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]

    game_list[game_num].end()
    emit("turnEnd", room=room_name)
    situationF5(room_name, data["name"])
    game_list[game_num].starting()
    game_list[game_num].draw()
    emit("draw", room=room_name)
    emit("enemyDraw", room=data["name"])
    judge(game_num, room_name, data["name"])


@socketio.on("setBarrier", namespace="/websocket")
def set_barrier(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    emit("setBarrier",
         {"card": card_to_json(game_list[game_num].player[game_list[game_num].turn_player].hand.card_list[data["handLength"]])},
         room=room_name)
    emit("damage", 1, room=room_name)
    emit("handDecrease", {"len": data["handLength"]}, room=room_name)
    game_list[game_num].set_barrier(data["handLength"])
    judge(game_num, room_name, data["name"])
    situationF5(room_name, data["name"])


@socketio.on("summon", namespace="/websocket")
def summon(data: dict):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    game: Game = game_list[game_num]
    emit("summon",
         {"card": card_to_json(game.player[game.turn_player].hand.card_list[data["handLength"]])},
         room=room_name)
    print(game.player[game.turn_player].hand.card_list)
    # print(data.keys())
    if "costLength" in data:
        game.summon_magician(data["handLength"], data["costLength"], data["barrierLength"])
        emit("driveBarrier", data["barrierLength"], room=room_name)
        emit("handDecrease", {"len": data["costLength"]}, room=room_name)
    elif "barrierLength" in data:
        if isinstance(data["barrierLength"], list) and len(data["barrierLength"]) == 2:
            game.summon_hero(data["handLength"], data["barrierLength"][0], data["barrierLength"][1])
            emit("driveBarrier", data["barrierLength"][0], room=room_name)
            emit("driveBarrier", data["barrierLength"][1], room=room_name)
        else:
            # print(data["barrierLength"])
            game.summon_soldier(data["handLength"], data["barrierLength"])
            emit("driveBarrier", data["barrierLength"], room=room_name)
        emit("damage", 1, room=room_name)
    else:
        game.summon_ace(data["handLength"])
        emit("damage", 1, room=room_name)
    judge(game_num, room_name, data["name"])
    print(game.player[game.turn_player].hand.card_list)
    emit("handDecrease", {"len": data["handLength"]}, room=room_name)
    situationF5(data["name"], room_name)


@socketio.on("chargeAll", namespace="/websocket")
def charge_all(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    game_list[game_num].player[game_list[game_num].turn_player].field.charge_all()
    emit("chargeAll", room=room_name)


@socketio.on("attack", namespace="/websocket")
def attack(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]

    print(data)

    game: Game = game_list[game_num]
    if game.player[game.turn_player].can_attack:
        game.attack(data["lengths"])
        print(game.battler)
        emit("attack", card_to_json(game.battler), room=room_name)
    else:
        emit("notAttacable", room=data["name"])
    situationF5(room_name, data["name"])


@socketio.on("defence", namespace="/websocket")
def defence(data):
    game_num = ID[data["name"]]
    game_list[game_num].defense(data["attack"], data["place"], data["lengths"])


@socketio.on("defence_end", namespace="/websocket")
def defence_end(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    game_list[game_num].battle()
    judge(game_num, room_name, data["name"])
    situationF5(data["name"], room_name)
    print(game_list[game_num].player[0].cemetery.card_list)
    print(game_list[game_num].player[1].cemetery.card_list)


socketio.run(app, debug=True)

