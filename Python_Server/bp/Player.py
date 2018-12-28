from . import Hand
from . import Field
from . import Deck
from . import Cemetery

class Player:
    def __init__(self, deck_list):
        self.hand = Hand()
        self.field = Field()
        self.cemetery = Cemetery()
        self.deck = Deck(deck_list)
        self.deck.shuffle()
        self.can_attack = True
        self.can_draw = 7
        for i in range(0, 7):
            self.draw()

        """
        Parameters
        ---------------
        deck_list : list of Card
            カードのリスト(デッキ)
        """

    # 一枚ドローして手札に加える
    def draw(self):
        self.hand.add(self.deck.draw())

    # numの数だけドローして手札に加える
    def draws(self, num):
        for i in range(0, num):
            self.hand.add(self.deck.draw())

    # ゲームの始めにデッキの一番上を一枚墓地に置く(先攻・後攻決め)
    def first_step(self):
        card = self.deck.first_step()
        self.cemetery.add(card)
        return [card.number, card.mark]

    # 自分のフィールドの兵士、防壁を全てチャージ状態にする
    def charge(self):
        self.field.charge_all()
        self.field.can_attack_all()

    # 手札が6枚を超えると手札の最後を墓地に置く
    def clean_up(self, length):
        if len(self.hand) > 7:
            self.cemetery.add(self.hand.get(length))

    # ダメージを受ける(デッキからダメージ文カードを墓地へ置く)
    def damage(self):
        self.cemetery.add(self.deck.damage())

    # 防壁の召喚
    def set_barrier(self, length):
        self.damage()
        self.field.set_barrier(self.hand.get(length))

    # 兵士の召喚
    def summon_soldier(self, hand_length, barrier_length):
        self.damage()
        self.field.drive("barrier", barrier_length)
        self.field.summon(self.hand.get(hand_length))

    # エースの召喚
    def summon_ace(self, hand_length):
        self.damage()
        self.field.summon(self.hand.get(hand_length))

    # 英雄の召喚
    def summon_hero(self, hand_length, barrier_length1, barrier_length2):
        self.damage()
        self.field.drive("barrier", barrier_length1)
        self.field.drive("barrier", barrier_length2)
        self.field.summon(self.hand.get(hand_length))

    # 魔術師の召喚
    def summon_magician(self, hand_length, cost_hand_langth, barrier_length):
        self.field.drive("barrier", barrier_length)
        if hand_length > cost_hand_langth:
            self.field.summon(self.hand.get(hand_length))
            self.cemetery.add(self.hand.get(cost_hand_langth))
        else:
            self.cemetery.add(self.hand.get(cost_hand_langth))
            self.field.summon(self.hand.get(hand_length))

    # 攻撃する兵士のリストを返す
    def declaration_attack(self, soldier_length):
        attacker = []
        for i in range(0, len(soldier_length)):
            if self.field.soldier[soldier_length[i]].can_attack:
                attacker.append(self.field.soldier[soldier_length[i]])
                self.field.drive("soldier", soldier_length[i])

        return attacker

    # 世代交代
    def alternation(self):
        while True:
            card = self.deck.get()
            if card.number == 0 or card.number == 1 or (11 <= card.number <= 13):
                break

            self.cemetery.add(card)
        self.hand.add(card)

    # フィールドからカードを取り除く
    def destruction(self, place, length):
        card = self.field.destruction(place, length)
        if card.number == 0 or card.number == 1 or (11 <= card.number <= 13):
            self.alternation()

        self.cemetery.add(card)

    # 兵士でブロック(複数可)
    def declaration_defense(self, soldier_length):
        num = 0
        for i in range(0, len(soldier_length)):
            self.field.drive("soldier", soldier_length[i])
            num += self.field.soldier[soldier_length[i]].number

        return num

    # 防壁でブロック
    def declaration_defense_barrier(self, length):
        self.field.drive("barrier", length)
        self.field.open(length)

    """未実装"""
    def no_cost_spell(self, hand_length):
        self.cemetery.add(self.hand.get(hand_length))

    def once_spell(self, hand_length, cost_length):
        self.cemetery.add(self.hand.get(cost_length))
        self.cemetery.add(self.hand.get(hand_length))

    def twice_spell(self, hand_lengths):
        self.cemetery.add(self.hand.get(hand_lengths[0]))
        self.cemetery.add(self.hand.get(hand_lengths[1]))

    def up(self, hand_length, cost_length, length):
        num = self.hand.card_list[hand_length].number
        self.field.soldier[length].attack += num
        self.once_spell(hand_length, cost_length)

    def down(self, hand_length, cost_length):
        num = self.hand.card_list[hand_length].number
        self.once_spell(hand_length, cost_length)
        return num

    def twist(self, hand_length, cost_length, player, length):
        if player:
            num = self.hand.card_list[hand_length].number
            self.field.soldier[length].attack += num

        self.once_spell(hand_length, cost_length)

    def counter(self, hand_length, cost_length):
        self.once_spell(hand_length, cost_length)

    def barrier_defense(self, hand_length, player, length):
        if player:
            self.destruction("barrier", length)

        self.twice_spell(hand_length)

    def throwing(self, hand_lengths):
        self.twice_spell(hand_lengths)
        if hand_lengths[0] == "spade":
            return hand_lengths[0].number
        else:
            return hand_lengths[1].number

    def search(self, length, number, mark):
        self.no_cost_spell(length)
        self.deck.search(number, mark)
