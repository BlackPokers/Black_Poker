import json


class MyJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Card):  # Cardは'Card'としてエンコード
            return 'Card'
        return super(MyJSONEncoder, self).default(o)  # 他の型はdefaultのエンコード方式を使用


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
