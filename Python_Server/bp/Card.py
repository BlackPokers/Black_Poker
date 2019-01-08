class Card:
    def __init__(self, number: int, mark: str):
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
        return "[" + self.number + "," + self.mark + "]"





