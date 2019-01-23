import json


def card_to_json(o):
    if isinstance(o, Card):  # Cardは'Card'としてエンコード
        return {
            "number": o.number,
            "attack": o.attack,
            "canAttack": o.can_attack,
            "isCharge": o.is_charge,
            "isFront": o.is_front,
            "mark": o.mark,
            "job": o.job
        }
    elif isinstance(o, list):  # Cardは'Card'としてエンコード
        tmp = []
        for i in o:
            tmp.append(card_to_json(i))
        return tmp
    elif isinstance(o, dict):
        tmp:dict = {}
        for k, v in o.items():
            tmp[k] = card_to_json(v)
            print(tmp[k])
        return tmp
    else:
        return o

class Card:
    """
    Attributes
    ----------
    number: int
        カードの数字
    attack: int
        カードの攻撃力
    can_attack: bool
        カードが攻撃できるかどうか
    is_charge: bool
        カードがチャージ状態かどうか
    is_front: bool
        カードが表向きかどうか
    mark: str
        カードのマーク
    job: str
        カードの役職(兵士、英雄、エース、魔術師)
    """

    def __init__(self, number: int, mark: str):
        """
        カードのコンストラクタ
        :param number: カードの数字
        :param mark: カードのマーク
        """
        self.number = number  # カードの数字
        self.attack = number  # カードの攻撃力(数字)
        self.can_attack = False  # そのカードが攻撃できるかどうか
        self.is_charge = True  # チャージ状態かどうか
        self.is_front = False  # 表向きかどうか
        self.mark = mark  # そのカードのマーク
        self.job = ""  # そのカードの役職

        if 2 <= self.number <= 10:
            self.job = "soldier"
        elif 11 <= self.number <= 13:
            self.job = "hero"
        elif self.number == 1:
            self.job = "ace"
            self.can_attack = True
        elif self.number == 0:
            self.job = "magician"
            self.can_attack = True

    # カードの数字とマークを返す
    def __str__(self):
        return "[" + str(self.number) + "," + self.mark + "]"

    def __repr__(self):
        return "[" + str(self.number) + "," + self.mark + "]"