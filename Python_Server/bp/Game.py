from . import Card
from . import Player

class Game:
    def __init__(self):
        self.player = [Player(make_start_deck()), Player(make_start_deck())]
        self.turn = 0
        self.turn_player = 0
        self.battler = []
        self.p_name0 = None
        self.p_name1 = None

    def set_barrier(self, length):
        self.player[self.turn_player].set_barrier(length)

    def summon_ace(self, length):
        self.player[self.turn_player].summon_ace(length)

    def summon_soldier(self, length, barrier_length):
        self.player[self.turn_player].summon_soldier(length, barrier_length)

    def summon_hero(self, length, barrier_length1, barrier_length2):
        self.player[self.turn_player].summon_hero(length, barrier_length1, barrier_length2)

    def summon_magician(self, length, barrier_length, cost_hand_lenght):
        self.player[self.turn_player].summon_ace(length, cost_hand_lenght, barrier_length)

    def draw(self):
        self.player[self.turn_player].draw()

    def end(self):
        self.turn += 1
        self.turn_player = 1 if self.turn_player == 0 else 0

    def starting(self):
        self.player[self.turn_player].charge()
        self.player[self.turn_player].can_draw = 2
        self.player[self.turn_player].can_attack = True

    def attack(self, lengths):
        self.player[self.turn_player].can_attack = False
        attacker = self.player[self.turn_player].declaration_attack(lengths)

        for i in range(0, len(attacker)):
            self.battler.append({"attack": {"card": attacker[i], "len": lengths[i]}})

    def defense(self, attack, place, lengths):
        attack_length = self.search_battler(attack)

        if place == "barrier":
            self.player[1 if self.turn_player == 0 else 0].declaration_defense_barrier(lengths)
            self.battler[attack_length].barrier = {"card": self.player[1 if self.turn_player == 0 else 0].field.barrier[lengths[0]],
                                                   "len": lengths[0]}
        else:
            self.battler[attack_length].defense = []
            for i in range(0, len(lengths)):
                self.player[1 if self.turn_player == 0 else 0].declaration_defense(lengths[i])
                self.battler[attack_length].defense.append({"card": self.player[1 if self.turn_player == 0 else 0].field.soldier[lengths[i]],
                                                            "len": lengths[i]})

    def search_battler(self, attack):
        for i in range(0, len(self.battler)):
            if self.battler[i].attack.card.mark == attack.card.mark and self.battler[i].attack.card.number == attack.card.number:
                return i

        return -1

    def battle(self):
        for i in range(0, len(self.battler)):
            if len(self.battler) > i and self.battler[i] is not None:
                continue

            if self.battler[i].barrier is not None:
                bool = False
                bool = self.battler[i].barrier.number == self.battler[i].attack.number

                if bool:
                    self.player[self.turn_player].destruction("soldier", self.battler[i].attack.len)




