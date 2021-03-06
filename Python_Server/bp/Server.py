import json

import Game
from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from Card import card_to_json
import os


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
    # if num.count() == 2:
    #    num.inc()
    #    num.reset()
    # num.count_up()
    # print(num.get())
    # join_room(str(num.get()))
    # emit('my response', {'data': str(num.get())}, room=str(num.get()))


def get_keys_from_value(d: dict, val, key: str):
    return [k for k, v in d.items() if v == val and key != k]


def judge(number: int, e_room: str, m_room: str):
    game: Game = game_list[number]
    if len(game.player[0].deck.card_list) <= 0:
        emit("fin", 1, room=e_room)
        emit("fin", 1, room=m_room)
    elif len(game.player[1].deck.card_list) <= 0:
        emit("fin", 0, room=e_room)
        emit("fin", 0, room=m_room)


def situationF5(m_room: str, e_room: str):
    game_num = ID[m_room]
    game:Game = game_list[game_num]
    d = {
        "user_1": {"id": game.p_name0,
                   "name": game.p_name0,
                   "hand": card_to_json(game.player[0].hand.card_list),
                   "deck": card_to_json(game.player[0].deck.card_list),
                   "cemetery": card_to_json(game.player[0].cemetery.card_list),
                   "barrier": card_to_json(game.player[0].field.barrier),
                   "soldier": card_to_json(game.player[0].field.soldier)},
        "user_2": {"id": game.p_name1,
                   "name": game.p_name1,
                   "hand": card_to_json(game.player[1].hand.card_list),
                   "deck": card_to_json(game.player[1].deck.card_list),
                   "cemetery": card_to_json(game.player[1].cemetery.card_list),
                   "barrier": card_to_json(game.player[1].field.barrier),
                   "soldier": card_to_json(game.player[1].field.soldier)}
    }

    emit("situation", d, room=e_room)


@socketio.on("login", namespace="/websocket")
def login(data):
    base = os.path.dirname(os.path.abspath(__file__))
    name = os.path.normpath(os.path.join(base, './id.csv'))
    f = open(name, 'r')
    read = f.readlines()
    print(data["name"])
    for row in read:
        row = row.split("\n")[0]
        print(row)
        if data["name"] == row:
            print("break")
            break
    else:
        f.close()
        return
    f.close()
    print("end")

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

        game_num = ID[data["name"]]  # ゲーム番号を取得
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
    game:Game = game_list[game_num]
    emit("situation", {"user_1": {"id": game.p_name0,
                                  "name": game.p_name0,
                                  "hand": card_to_json(game.player[0].hand.card_list),
                                  "deck": card_to_json(game.player[0].deck.card_list),
                                  "cemetery": card_to_json(game.player[0].cemetery.card_list),
                                  "barrier": [],
                                  "soldier": []},
                       "user_2": {"id": game.p_name1,
                                  "name": game.p_name1,
                                  "hand": card_to_json(game.player[1].hand.card_list),
                                  "deck": card_to_json(game.player[1].deck.card_list),
                                  "cemetery": card_to_json(game.player[1].cemetery.card_list),
                                  "barrier": [],
                                  "soldier": []}
                       }, room=data["name"])

    # print("c")


@socketio.on("turnEnd", namespace="/websocket")
def turn_end(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]

    game: Game = game_list[game_num]
    game.end()
    emit("turnEnd", room=room_name)
    situationF5(room_name, data["name"])
    game.starting()
    game.draw()
    emit("draw", room=room_name)
    emit("enemyDraw", room=data["name"])
    judge(game_num, room_name, data["name"])


@socketio.on("setBarrier", namespace="/websocket")
def set_barrier(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    game:Game = game_list[game_num]
    emit("setBarrier",
         {"card": card_to_json(
             game.player[game.turn_player].hand.card_list[data["handLength"]])},
         room=room_name)
    emit("damage", 1, room=room_name)
    emit("handDecrease", {"len": data["handLength"]}, room=room_name)
    game.set_barrier(data["handLength"])
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
    game: Game = game_list[game_num]
    game.player[game_list[game_num].turn_player].field.charge_all()
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
    game: Game = game_list[game_num]
    game.defense(data["attack"], data["place"], data["lengths"])


@socketio.on("defence_end", namespace="/websocket")
def defence_end(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    game: Game = game_list[game_num]
    game.battle()
    judge(game_num, room_name, data["name"])
    situationF5(data["name"], room_name)
    print(game.player[0].cemetery.card_list)
    print(game.player[1].cemetery.card_list)


@socketio.on("spell", namespace="/websocket")
def on_spell(data):
    game_num = ID[data["name"]]
    room_name = get_keys_from_value(ID, game_num, data["name"])[0]
    game: Game = game_list[game_num]
    print(data["target"]["player"])
    print(data["target"]["playerr"])
    print(game.turn_player)
    print(data["hand"][0])
    print(game.player[data["target"]["playerr"]].hand.card_list[data["hand"][0]])
    print(game.player[data["target"]["playerr"]].hand.card_list[data["hand"][0]].mark)
    print(data["target"]["index"])
    if game.player[data["target"]["playerr"]].hand.card_list[data["hand"][0]].mark == "heart":
        game.up(data["target"]["player"], data["hand"][0], data["cost"][0], data["target"]["index"][0])
    elif game.player[data["target"]["playerr"]].hand.card_list[data["hand"][0]].mark == "spade":
        game.down(data["target"]["playerr"],data["target"]["player"], data["hand"][0], data["cost"][0], data["target"]["index"][0])
    elif game.player[data["target"]["playerr"]].hand.card_list[data["hand"][0]].mark == "diamond":
        game.twist(data["target"]["player"], data["hand"][0], data["cost"][0], data["target"]["index"][0])
    situationF5(room_name, data["name"])

@socketio.on('signUp', namespace='/http')
def test_connect(data):
    base = os.path.dirname(os.path.abspath(__file__))
    name = os.path.normpath(os.path.join(base, './id.csv'))
    f = open(name, 'r')
    read = f.readlines()
    for row in read:
        row = row.split("\n")[0]
        if data["id"] == row:
            return
    f.close()
    f = open(name, 'a')
    f.write(data["id"] + "\n")
    f.close()

socketio.run(app, debug=False, host='0.0.0.0')
