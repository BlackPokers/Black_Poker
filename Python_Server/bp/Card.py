class Card:
    def __init__(self, number, mark):
        self.number = number
        self.attack = number
        self.can_attack = False
        self.is_charge = True
        self.is_front = False
        self.mark = mark
        self.job = ""

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

    def __str__(self):
        return "[" + self.number + "," + self.mark + "]"





