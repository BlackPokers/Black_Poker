class Field:
    def __init__(self):
        self.soldier = []
        self.barrier = []

    # 防壁の召喚
    def set_barrier(self, card):
        self.barrier.append(card)
        self.barrier[len(self.barrier) - 1].is_charge = True
        self.barrier[len(self.barrier) - 1].is_front = True

    # 兵士の召喚
    def summon(self, card):
        self.soldier.append(card)
        if card.job == "ace" or card.job == "magician":
            self.soldier[len(self.soldier) - 1].can_attack = True

    # 攻撃可能な兵士のリストを返す
    def look_attackable(self):
        list = []
        for i in len(self.soldier):
            if self.soldier[i].can_attack:
                list.append(self.soldier[i])
        return list

    # 特定の兵士を攻撃可能にする
    def recovery(self, length):
        self.soldier[length].can_attack = True

    # 兵士全員を攻撃可能にする
    def recovery_all(self):
        for i in len(self.soldier):
            self.recvery(i)

    # 兵士全員を攻撃可能にする
    def can_attack_all(self):
        for i in len(self.soldier):
            self.soldier[i].can_attack = True

    # カードをチャージ状態にする
    def charge(self, place, length):
        if place == "soldier":
            self.soldier[length].is_charge = True
        elif place == "barrier":
            self.barrier[length].is_charge = True

    # カード全てをチャージ状態にする
    def charge_all(self):
        for i in len(self.soldier):
            self.charge("soldier", i)

        for i in len(self.barrier):
            self.charge("barrier", i)

    # カードをドライブ状態にする
    def drive(self, place, length):
        if place == "soldier":
            self.soldier[length].is_charge = False
        elif place == "barrier":
            self.barrier[length].is_charge = False

    # フィールドからカードを取り除く
    def destruction(self, place, length):
        if place == "soldier":
            card = self.soldier[length]
            self.soldier.pop(length)
        elif place == "barrier":
            card = self.barrier[length]
            self.barrier.pop(length)

        return card

    # 防壁を表向きにする
    def open(self, length):
        self.barrier[length].is_front = True
