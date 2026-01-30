import { t as Qe, c as js, a as $s, L as ee, u as se, A as ie, h as W, E as ae, k as zs, l as Vs, m as Le, n as Ie, j as Wr, g as Qs, e as qr, f as _r, i as ye, d as jr, D as He, o as $r, r as Hs, p as Ft, q as zr, s as Ks, v as Vr, x as tt } from "./ErrorMessage-Bm1j5mBT.js";
import { C as Ec, z as Sc, y as Pc } from "./ErrorMessage-Bm1j5mBT.js";
import { jsx as e, jsxs as i, Fragment as te } from "react/jsx-runtime";
import { useState as N, useRef as Q, useMemo as $, useEffect as I, useCallback as C, useId as Qr, Component as Ys, createContext as Gs, useContext as Hr } from "react";
import { b as Js, s as Xs, c as Ot, d as Zs, E as en, a as tn, P as xe, e as Kr, g as Yr, p as Gr, f as Jr, h as rn, i as sn, O as Xr, j as nn } from "./EmailRegisterForm-m3rX3A6X.js";
import { T as Lc, u as Tc, k as Dc, l as Mc } from "./EmailRegisterForm-m3rX3A6X.js";
import { b as Zr, v as on } from "./validation-BebL7hMF.js";
import { G as an } from "./GoogleLoginButton-CvDoOc-0.js";
import { u as Bc } from "./GoogleLoginButton-CvDoOc-0.js";
import { d as Xt, S as cn } from "./SolanaLoginButton-h32xN2PQ.js";
import { u as Ic } from "./SolanaLoginButton-h32xN2PQ.js";
function Ke(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function es(t, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : t ? r.every((s) => typeof s == "string") : r.every((s) => Number.isSafeInteger(s)) : !1;
}
function ln(t) {
  if (typeof t != "function")
    throw new Error("function expected");
  return !0;
}
function Ye(t, r) {
  if (typeof r != "string")
    throw new Error(`${t}: string expected`);
  return !0;
}
function Te(t) {
  if (!Number.isSafeInteger(t))
    throw new Error(`invalid integer: ${t}`);
}
function Ge(t) {
  if (!Array.isArray(t))
    throw new Error("array expected");
}
function Je(t, r) {
  if (!es(!0, r))
    throw new Error(`${t}: array of strings expected`);
}
function ts(t, r) {
  if (!es(!1, r))
    throw new Error(`${t}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function dn(...t) {
  const r = (o) => o, s = (o, l) => (c) => o(l(c)), a = t.map((o) => o.encode).reduceRight(s, r), n = t.map((o) => o.decode).reduce(s, r);
  return { encode: a, decode: n };
}
// @__NO_SIDE_EFFECTS__
function un(t) {
  const r = typeof t == "string" ? t.split("") : t, s = r.length;
  Je("alphabet", r);
  const a = new Map(r.map((n, o) => [n, o]));
  return {
    encode: (n) => (Ge(n), n.map((o) => {
      if (!Number.isSafeInteger(o) || o < 0 || o >= s)
        throw new Error(`alphabet.encode: digit index outside alphabet "${o}". Allowed: ${t}`);
      return r[o];
    })),
    decode: (n) => (Ge(n), n.map((o) => {
      Ye("alphabet.decode", o);
      const l = a.get(o);
      if (l === void 0)
        throw new Error(`Unknown letter: "${o}". Allowed: ${t}`);
      return l;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function hn(t = "") {
  return Ye("join", t), {
    encode: (r) => (Je("join.decode", r), r.join(t)),
    decode: (r) => (Ye("join.decode", r), r.split(t))
  };
}
// @__NO_SIDE_EFFECTS__
function mn(t, r = "=") {
  return Te(t), Ye("padding", r), {
    encode(s) {
      for (Je("padding.encode", s); s.length * t % 8; )
        s.push(r);
      return s;
    },
    decode(s) {
      Je("padding.decode", s);
      let a = s.length;
      if (a * t % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; a > 0 && s[a - 1] === r; a--)
        if ((a - 1) * t % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return s.slice(0, a);
    }
  };
}
function Rt(t, r, s) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (s < 2)
    throw new Error(`convertRadix: invalid to=${s}, base cannot be less than 2`);
  if (Ge(t), !t.length)
    return [];
  let a = 0;
  const n = [], o = Array.from(t, (c) => {
    if (Te(c), c < 0 || c >= r)
      throw new Error(`invalid integer: ${c}`);
    return c;
  }), l = o.length;
  for (; ; ) {
    let c = 0, d = !0;
    for (let u = a; u < l; u++) {
      const p = o[u], f = r * c, h = f + p;
      if (!Number.isSafeInteger(h) || f / r !== c || h - p !== f)
        throw new Error("convertRadix: carry overflow");
      const w = h / s;
      c = h % s;
      const m = Math.floor(w);
      if (o[u] = m, !Number.isSafeInteger(m) || m * s + c !== h)
        throw new Error("convertRadix: carry overflow");
      if (d)
        m ? d = !1 : a = u;
      else continue;
    }
    if (n.push(c), d)
      break;
  }
  for (let c = 0; c < t.length - 1 && t[c] === 0; c++)
    n.push(0);
  return n.reverse();
}
const rs = (t, r) => r === 0 ? t : rs(r, t % r), Xe = /* @__NO_SIDE_EFFECTS__ */ (t, r) => t + (r - rs(t, r)), it = /* @__PURE__ */ (() => {
  let t = [];
  for (let r = 0; r < 40; r++)
    t.push(2 ** r);
  return t;
})();
function Bt(t, r, s, a) {
  if (Ge(t), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (s <= 0 || s > 32)
    throw new Error(`convertRadix2: wrong to=${s}`);
  if (/* @__PURE__ */ Xe(r, s) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${s} carryBits=${/* @__PURE__ */ Xe(r, s)}`);
  let n = 0, o = 0;
  const l = it[r], c = it[s] - 1, d = [];
  for (const u of t) {
    if (Te(u), u >= l)
      throw new Error(`convertRadix2: invalid data word=${u} from=${r}`);
    if (n = n << r | u, o + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${o} from=${r}`);
    for (o += r; o >= s; o -= s)
      d.push((n >> o - s & c) >>> 0);
    const p = it[o];
    if (p === void 0)
      throw new Error("invalid carry");
    n &= p - 1;
  }
  if (n = n << s - o & c, !a && o >= r)
    throw new Error("Excess padding");
  if (!a && n > 0)
    throw new Error(`Non-zero padding: ${n}`);
  return a && o > 0 && d.push(n >>> 0), d;
}
// @__NO_SIDE_EFFECTS__
function pn(t) {
  Te(t);
  const r = 2 ** 8;
  return {
    encode: (s) => {
      if (!Ke(s))
        throw new Error("radix.encode input should be Uint8Array");
      return Rt(Array.from(s), r, t);
    },
    decode: (s) => (ts("radix.decode", s), Uint8Array.from(Rt(s, t, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function fn(t, r = !1) {
  if (Te(t), t <= 0 || t > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Xe(8, t) > 32 || /* @__PURE__ */ Xe(t, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (s) => {
      if (!Ke(s))
        throw new Error("radix2.encode input should be Uint8Array");
      return Bt(Array.from(s), 8, t, !r);
    },
    decode: (s) => (ts("radix2.decode", s), Uint8Array.from(Bt(s, t, 8, r)))
  };
}
function gn(t, r) {
  return Te(t), ln(r), {
    encode(s) {
      if (!Ke(s))
        throw new Error("checksum.encode: input should be Uint8Array");
      const a = r(s).slice(0, t), n = new Uint8Array(s.length + t);
      return n.set(s), n.set(a, s.length), n;
    },
    decode(s) {
      if (!Ke(s))
        throw new Error("checksum.decode: input should be Uint8Array");
      const a = s.slice(0, -t), n = s.slice(-t), o = r(a).slice(0, t);
      for (let l = 0; l < t; l++)
        if (o[l] !== n[l])
          throw new Error("Invalid checksum");
      return a;
    }
  };
}
const je = {
  alphabet: un,
  chain: dn,
  checksum: gn,
  convertRadix: Rt,
  convertRadix2: Bt,
  radix: pn,
  radix2: fn,
  join: hn,
  padding: mn
};
const wn = (t) => t[0] === "あいこくしん";
function yn(t) {
  if (typeof t != "string")
    throw new TypeError("invalid mnemonic type: " + typeof t);
  return t.normalize("NFKD");
}
function bn(t) {
  const r = yn(t), s = r.split(" ");
  if (![12, 15, 18, 21, 24].includes(s.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: r, words: s };
}
function ss(t) {
  Js(t, 16, 20, 24, 28, 32);
}
const vn = (t) => {
  const r = 8 - t.length / 4;
  return new Uint8Array([Xs(t)[0] >> r << r]);
};
function ns(t) {
  if (!Array.isArray(t) || t.length !== 2048 || typeof t[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return t.forEach((r) => {
    if (typeof r != "string")
      throw new Error("wordlist: non-string element: " + r);
  }), je.chain(je.checksum(1, vn), je.radix2(11, !0), je.alphabet(t));
}
function Wt(t, r) {
  const { words: s } = bn(t), a = ns(r).decode(s);
  return ss(a), a;
}
function os(t, r) {
  return ss(t), ns(r).encode(t).join(wn(r) ? "　" : " ");
}
function qt(t, r) {
  try {
    Wt(t, r);
  } catch {
    return !1;
  }
  return !0;
}
const be = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split(`
`), he = 12;
function An(t) {
  if (t.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${t.length}`);
  const s = os(t, be).split(" ");
  if (s.length !== he)
    throw new Error(`Unexpected word count: expected ${he}, got ${s.length}`);
  return s;
}
function Nn(t) {
  if (t.length !== he)
    throw new Error(`Invalid word count: expected ${he}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!qt(r, be))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = Wt(r, be);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return Qe(s);
}
function kn(t) {
  if (t.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${t.length}`);
  const s = os(t, be).split(" ");
  if (s.length !== he)
    throw new Error(`Unexpected word count: expected ${he}, got ${s.length}`);
  return s;
}
function Cn(t) {
  if (t.length !== he)
    throw new Error(`Invalid word count: expected ${he}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!qt(r, be))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = Wt(r, be);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return js(s);
}
function as(t) {
  if (t.length !== he)
    return !1;
  const r = t.join(" ").toLowerCase().trim();
  return qt(r, be);
}
function $e(t) {
  return be.includes(t.toLowerCase().trim());
}
function En(t, r = 5) {
  const s = t.toLowerCase().trim();
  return s.length === 0 ? [] : be.filter((a) => a.startsWith(s)).slice(0, r);
}
function Sn(t) {
  const r = [];
  for (let s = 0; s < t.length; s += 4)
    r.push(t.slice(s, s + 4));
  return r;
}
function Pn(t) {
  return t.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((r) => r.trim()).filter((r) => r.length > 0);
}
function ec({
  className: t = "",
  variant: r = "default",
  size: s = "md",
  children: a,
  menuItems: n = [],
  hideSignOut: o = !1
}) {
  const { user: l, isAuthenticated: c, isLoading: d, openLoginModal: u, logout: p } = $s(), [f, h] = N(!1), [w, m] = N(-1), g = Q(null), y = Q(null), A = $(
    () => [...n, ...o ? [] : [{ label: "Sign out", onClick: p }]],
    [n, o, p]
  );
  I(() => {
    if (!f) return;
    const b = (M) => {
      g.current && !g.current.contains(M.target) && (h(!1), m(-1));
    }, x = (M) => {
      M.key === "Escape" && (h(!1), m(-1), y.current?.focus());
    };
    return document.addEventListener("mousedown", b), document.addEventListener("keydown", x), () => {
      document.removeEventListener("mousedown", b), document.removeEventListener("keydown", x);
    };
  }, [f]);
  const v = C(
    (b) => {
      if (!(!f || A.length === 0))
        switch (b.key) {
          case "ArrowDown":
            b.preventDefault(), m((x) => (x + 1) % A.length);
            break;
          case "ArrowUp":
            b.preventDefault(), m((x) => (x - 1 + A.length) % A.length);
            break;
          case "Home":
            b.preventDefault(), m(0);
            break;
          case "End":
            b.preventDefault(), m(A.length - 1);
            break;
          case "Enter":
          case " ":
            w >= 0 && (b.preventDefault(), A[w].onClick(), h(!1), m(-1));
            break;
        }
    },
    [f, w, A]
  ), k = C(() => {
    A.length !== 0 && (h((b) => !b), m(-1));
  }, [A.length]), P = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, S = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (d)
    return /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-button ${S[r]} ${P[s]} ${t}`,
        disabled: !0,
        children: /* @__PURE__ */ e(ee, { size: "sm" })
      }
    );
  if (c && l) {
    const b = l.name || l.email || "User", x = Ot(l.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ i("div", { className: "cedros-user-menu", ref: g, onKeyDown: v, children: [
        /* @__PURE__ */ i(
          "button",
          {
            ref: y,
            type: "button",
            className: `cedros-button cedros-user-button ${P[s]} ${t}`,
            "aria-haspopup": "menu",
            "aria-expanded": f,
            "aria-label": `User menu for ${b}`,
            onClick: k,
            children: [
              x ? /* @__PURE__ */ e(
                "img",
                {
                  src: x,
                  alt: b,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ e("div", { className: "cedros-user-avatar-placeholder", children: (b[0] || "?").toUpperCase() }),
              /* @__PURE__ */ e("span", { className: "cedros-user-name", children: b })
            ]
          }
        ),
        f && /* @__PURE__ */ i("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          n.map((M, E) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${w === E ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: w === E ? 0 : -1,
              onClick: () => {
                M.onClick(), h(!1);
              },
              children: [
                M.icon && /* @__PURE__ */ e("span", { className: "cedros-dropdown-icon", children: M.icon }),
                M.label
              ]
            },
            E
          )),
          n.length > 0 && !o && /* @__PURE__ */ e("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !o && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${w === n.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: w === n.length ? 0 : -1,
              onClick: () => {
                p(), h(!1);
              },
              children: "Sign out"
            }
          )
        ] })
      ] })
    );
  }
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      className: `cedros-button ${S[r]} ${P[s]} ${t}`,
      onClick: u,
      children: a || "Sign in"
    }
  );
}
function is() {
  const { config: t } = se(), [r, s] = N(!1), [a, n] = N(!1), [o, l] = N(null), c = $(
    () => new ie({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), { checkLimit: d, getRemainingAttempts: u } = Zs({
    maxAttempts: 3,
    windowMs: 3e5
  }), p = C(
    async (m) => {
      if (!Zr(m)) {
        const g = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(g), g;
      }
      try {
        d();
      } catch (g) {
        const y = {
          code: "RATE_LIMITED",
          message: g instanceof Error ? g.message : "Too many attempts"
        };
        throw l(y), y;
      }
      s(!0), l(null), n(!1);
      try {
        await c.post("/forgot-password", { email: m }), n(!0);
      } catch (g) {
        const y = W(g, "Failed to send reset email");
        throw l(y), y;
      } finally {
        s(!1);
      }
    },
    [c, d]
  ), f = C(
    async (m, g) => {
      s(!0), l(null), n(!1);
      try {
        await c.post("/reset-password", { token: m, newPassword: g }), n(!0);
      } catch (y) {
        const A = W(y, "Failed to reset password");
        throw l(A), A;
      } finally {
        s(!1);
      }
    },
    [c]
  ), h = C(() => l(null), []), w = C(() => {
    l(null), n(!1), s(!1);
  }, []);
  return {
    forgotPassword: p,
    resetPassword: f,
    isLoading: r,
    isSuccess: a,
    error: o,
    clearError: h,
    reset: w,
    remainingAttempts: u()
  };
}
function xn({
  onSuccess: t,
  onCancel: r,
  className: s = ""
}) {
  const [a, n] = N(""), { forgotPassword: o, isLoading: l, isSuccess: c, error: d, clearError: u } = is(), p = Qr(), f = async (h) => {
    h.preventDefault();
    try {
      await o(a), t?.();
    } catch {
    }
  };
  return c ? /* @__PURE__ */ i("div", { className: `cedros-forgot-password-success ${s}`, children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ e("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ e(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e("h3", { className: "cedros-success-title", children: "Check your email" }),
    /* @__PURE__ */ i("p", { className: "cedros-success-message", children: [
      "If an account exists for ",
      /* @__PURE__ */ e("strong", { children: a }),
      ", you will receive a password reset link shortly."
    ] }),
    r && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: r,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ i("form", { className: `cedros-forgot-password-form ${s}`, onSubmit: f, children: [
    /* @__PURE__ */ i("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ e("p", { className: "cedros-form-subtitle", children: "Enter your email address and we'll send you a link to reset your password." })
    ] }),
    /* @__PURE__ */ e(ae, { error: d, onDismiss: u }),
    /* @__PURE__ */ i("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: p, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: p,
          type: "email",
          className: "cedros-input",
          value: a,
          onChange: (h) => n(h.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: l
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: l || !a,
          children: l ? /* @__PURE__ */ i(te, { children: [
            /* @__PURE__ */ e(ee, { size: "sm" }),
            "Sending..."
          ] }) : "Send reset link"
        }
      ),
      r && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: r,
          disabled: l,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const Ln = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return this.loaded ? Promise.resolve() : this.loading ? new Promise((t, r) => {
      this.callbacks.push({ resolve: t, reject: r });
    }) : (this.loading = !0, new Promise((t, r) => {
      this.callbacks.push({ resolve: t, reject: r });
      const s = document.getElementById("apple-signin-script");
      if (s) {
        window.AppleID ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = []) : s.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = [];
        });
        return;
      }
      const a = document.createElement("script");
      a.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", a.async = !0, a.defer = !0, a.id = "apple-signin-script", a.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = [];
      }, a.onerror = () => {
        this.loading = !1, a.remove();
        const n = new Error("Failed to load Apple Sign In script");
        this.callbacks.forEach((o) => o.reject(n)), this.callbacks = [];
      }, document.head.appendChild(a);
    }));
  }
};
function Tn() {
  const { config: t, _internal: r } = se(), [s, a] = N(!1), [n, o] = N(!1), [l, c] = N(null), d = Q(t), u = $(
    () => new ie({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  );
  I(() => {
    d.current = t;
  }, [t]), I(() => {
    if (!t.appleClientId)
      return;
    let h = !0;
    const w = () => {
      if (h)
        try {
          window.AppleID?.auth?.init({
            clientId: t.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), h && o(!0);
        } catch {
          h && c({
            code: "SERVER_ERROR",
            message: "Failed to initialize Apple Sign In"
          });
        }
    };
    return Ln.load().then(() => {
      h && w();
    }).catch(() => {
      h && c({
        code: "SERVER_ERROR",
        message: "Failed to load Apple Sign In"
      });
    }), () => {
      h = !1;
    };
  }, [t.appleClientId]);
  const p = C(async () => {
    if (!t.appleClientId) {
      const h = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw c(h), h;
    }
    if (!n) {
      const h = {
        code: "VALIDATION_ERROR",
        message: "Apple Sign In not initialized"
      };
      throw c(h), h;
    }
    a(!0), c(null);
    try {
      const h = await window.AppleID.auth.signIn(), w = h.authorization?.id_token;
      if (!w)
        throw new Error("No ID token received from Apple");
      const m = h.user?.name ? `${h.user.name.firstName || ""} ${h.user.name.lastName || ""}`.trim() : void 0, g = await u.post("/apple", {
        idToken: w,
        name: m || void 0
      });
      return d.current.callbacks?.onLoginSuccess?.(g.user, "apple"), r?.handleLoginSuccess(g.user, g.tokens), a(!1), g;
    } catch (h) {
      if (h.error === "popup_closed_by_user") {
        const g = {
          code: "SERVER_ERROR",
          message: "Apple Sign In was cancelled"
        };
        throw c(g), a(!1), g;
      }
      const m = W(h, "Apple sign-in failed");
      throw c(m), a(!1), m;
    }
  }, [t.appleClientId, n, u, r]), f = C(() => c(null), []);
  return {
    signIn: p,
    isLoading: s,
    isInitialized: n,
    error: l,
    clearError: f
  };
}
function cs() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const t = navigator.userAgent.toLowerCase(), r = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(t) || r.includes("mac") || /macintosh/.test(t) || r === "macintel" && navigator.maxTouchPoints > 1);
}
function Dn({
  onSuccess: t,
  onError: r,
  className: s = "",
  variant: a = "default",
  size: n = "md",
  disabled: o = !1,
  hideOnNonApple: l = !0
}) {
  const { signIn: c, isLoading: d, isInitialized: u } = Tn(), [p] = N(() => cs());
  if (l && !p)
    return null;
  const f = async () => {
    try {
      await c(), t?.();
    } catch (m) {
      const g = m instanceof Error ? m : new Error(String(m));
      r?.(g);
    }
  }, h = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-apple",
        outline: "cedros-button-apple-outline"
      }[a]} ${h[n]} ${s}`,
      onClick: f,
      disabled: o || !u || d,
      "aria-label": "Sign in with Apple",
      children: [
        d ? /* @__PURE__ */ e(ee, { size: "sm" }) : /* @__PURE__ */ e(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ e("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" })
          }
        ),
        /* @__PURE__ */ e("span", { children: "Continue with Apple" })
      ]
    }
  );
}
function ne(t, r) {
  if (!t) throw new Error(r);
}
function Mn(t) {
  return t.replace(/-/g, "+").replace(/_/g, "/");
}
function Ze(t) {
  ne(typeof t == "string" && t.length > 0, "Expected base64url string");
  const r = Mn(t), s = r + "=".repeat((4 - r.length % 4) % 4), a = atob(s), n = new Uint8Array(a.length);
  for (let o = 0; o < a.length; o++) n[o] = a.charCodeAt(o);
  return n.buffer;
}
function Ce(t) {
  const r = new Uint8Array(t);
  let s = "";
  for (let n = 0; n < r.length; n++) s += String.fromCharCode(r[n]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ls(t) {
  ne(typeof t == "object" && t !== null, "Invalid credential descriptor");
  const r = t;
  return ne(typeof r.type == "string", "Invalid credential descriptor type"), ne(typeof r.id == "string", "Invalid credential descriptor id"), {
    type: r.type,
    id: Ze(r.id),
    transports: Array.isArray(r.transports) ? r.transports : void 0
  };
}
function Rn(t) {
  ne(t && typeof t == "object", "Missing creation options");
  const r = t.publicKey;
  ne(r && typeof r == "object", "Missing creation options.publicKey"), ne(typeof r.challenge == "string", "Missing creation challenge"), ne(typeof r.rp == "object" && r.rp !== null, "Missing rp"), ne(typeof r.user == "object" && r.user !== null, "Missing user");
  const s = r.rp, a = r.user;
  ne(typeof s.name == "string", "Missing rp.name"), ne(typeof a.id == "string", "Missing user.id"), ne(typeof a.name == "string", "Missing user.name"), ne(typeof a.displayName == "string", "Missing user.displayName");
  const n = Array.isArray(r.excludeCredentials) ? r.excludeCredentials.map(ls) : void 0, o = Array.isArray(r.pubKeyCredParams) ? r.pubKeyCredParams.map((l) => ({
    type: l.type,
    alg: l.alg
  })) : [];
  return {
    challenge: Ze(r.challenge),
    rp: {
      name: s.name,
      id: typeof s.id == "string" ? s.id : void 0
    },
    user: {
      id: Ze(a.id),
      name: a.name,
      displayName: a.displayName
    },
    pubKeyCredParams: o,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    attestation: typeof r.attestation == "string" ? r.attestation : void 0,
    authenticatorSelection: typeof r.authenticatorSelection == "object" && r.authenticatorSelection !== null ? r.authenticatorSelection : void 0,
    excludeCredentials: n,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
}
function Bn(t) {
  ne(t && typeof t == "object", "Missing request options");
  const r = t.publicKey;
  ne(r && typeof r == "object", "Missing request options.publicKey"), ne(typeof r.challenge == "string", "Missing request challenge");
  const s = Array.isArray(r.allowCredentials) ? r.allowCredentials.map(ls) : void 0;
  return {
    challenge: Ze(r.challenge),
    rpId: typeof r.rpId == "string" ? r.rpId : void 0,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    userVerification: typeof r.userVerification == "string" ? r.userVerification : void 0,
    allowCredentials: s,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
}
function Zt(t) {
  const r = Ce(t.rawId), s = t.response, n = { ...{
    clientDataJSON: Ce(s.clientDataJSON)
  } };
  if ("attestationObject" in s) {
    const o = s;
    if (n.attestationObject = Ce(o.attestationObject), typeof o.getTransports == "function")
      try {
        n.transports = o.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in s) {
    const o = s;
    n.authenticatorData = Ce(o.authenticatorData), n.signature = Ce(o.signature), o.userHandle && (n.userHandle = Ce(o.userHandle));
  }
  return {
    id: t.id,
    rawId: r,
    type: t.type,
    authenticatorAttachment: t.authenticatorAttachment ?? void 0,
    clientExtensionResults: t.getClientExtensionResults?.() ?? {},
    response: n
  };
}
function Un() {
  if (typeof window < "u") {
    const t = window.location?.hostname, r = t === "localhost" || t === "127.0.0.1" || t?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !r)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function er(t) {
  if (!(t instanceof Error)) return null;
  const r = t.name;
  return r === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : r === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : r === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function In() {
  const { config: t, _internal: r } = se(), [s, a] = N(!1), [n, o] = N(null), l = $(
    () => new ie({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: r?.getAccessToken
    }),
    [r?.getAccessToken, t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), c = C(() => o(null), []), d = Un(), u = C(
    async (f) => {
      if (!d) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw o(h), h;
      }
      a(!0), o(null);
      try {
        const h = await l.post(
          "/webauthn/auth/options",
          { email: f?.email }
        ), w = Bn(h.options), m = await navigator.credentials.get({
          publicKey: w
        });
        if (!m)
          throw new Error("Passkey authentication returned no credential");
        const g = await l.post("/webauthn/auth/verify", {
          challengeId: h.challengeId,
          credential: Zt(m)
        });
        return t.callbacks?.onLoginSuccess?.(g.user, "webauthn"), r?.handleLoginSuccess(g.user, g.tokens), g;
      } catch (h) {
        const m = er(h) ?? W(h, "Passkey sign-in failed");
        throw o(m), m;
      } finally {
        a(!1);
      }
    },
    [l, t.callbacks, r, d]
  ), p = C(
    async (f) => {
      if (!d) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw o(h), h;
      }
      a(!0), o(null);
      try {
        const h = await l.post(
          "/webauthn/register/options",
          {}
        ), w = Rn(h.options), m = await navigator.credentials.create({
          publicKey: w
        });
        if (!m)
          throw new Error("Passkey registration returned no credential");
        const g = await l.post(
          "/webauthn/register/verify",
          {
            challengeId: h.challengeId,
            credential: Zt(m),
            label: f?.label
          }
        );
        if (!g.success)
          throw new Error("Passkey registration failed");
        return { credentialId: g.credentialId, label: g.label };
      } catch (h) {
        const m = er(h) ?? W(h, "Passkey registration failed");
        throw o(m), m;
      } finally {
        a(!1);
      }
    },
    [l, d]
  );
  return {
    isSupported: d,
    isLoading: s,
    error: n,
    clearError: c,
    authenticatePasskey: u,
    registerPasskey: p
  };
}
function Fn({
  onSuccess: t,
  className: r = "",
  children: s,
  disabled: a
}) {
  const { authenticatePasskey: n, isLoading: o, isSupported: l } = In(), c = a || !l || o;
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${r}`,
      onClick: async () => {
        await n(), t?.();
      },
      disabled: c,
      "aria-disabled": c,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ e(On, {}) }),
        /* @__PURE__ */ e("span", { children: s ?? (o ? "Continuing..." : "Continue with Passkey") })
      ]
    }
  );
}
function On() {
  return /* @__PURE__ */ i(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ e("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ e("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ e("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ e("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ e("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ e("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ e("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ e("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
const Re = ["login", "register"];
function _t({ onSuccess: t, className: r = "", defaultTab: s = "login" }) {
  const { config: a } = se(), [n, o] = N(s), [l, c] = N("form"), [d, u] = N(() => Xt()), [p] = N(() => cs());
  I(() => {
    const P = () => u(Xt());
    return P(), window.addEventListener("load", P), window.addEventListener("focus", P), () => {
      window.removeEventListener("load", P), window.removeEventListener("focus", P);
    };
  }, []);
  const f = a.forms?.forgotPassword?.mode ?? "reset", h = C(
    (P) => {
      const S = Re.indexOf(n);
      let b = S;
      switch (P.key) {
        case "ArrowLeft":
        case "ArrowUp":
          b = S === 0 ? Re.length - 1 : S - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          b = S === Re.length - 1 ? 0 : S + 1;
          break;
        case "Home":
          b = 0;
          break;
        case "End":
          b = Re.length - 1;
          break;
        default:
          return;
      }
      P.preventDefault();
      const x = Re[b];
      o(x), document.getElementById(`cedros-tab-${x}`)?.focus();
    },
    [n]
  ), w = a.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, m = w.email !== !1, g = w.google !== !1 && a.googleClientId, y = w.apple !== !1 && a.appleClientId && p, A = w.solana !== !1 && d, v = w.webauthn !== !1, k = m && (g || y || A || v);
  return l === "forgotPassword" ? /* @__PURE__ */ e("div", { className: `cedros-login-form ${r}`, children: /* @__PURE__ */ e(xn, { onCancel: () => c("form") }) }) : /* @__PURE__ */ i("div", { className: `cedros-login-form ${r}`, children: [
    (v || g || y || A) && /* @__PURE__ */ i("div", { className: "cedros-social-buttons", children: [
      v && /* @__PURE__ */ e(Fn, { onSuccess: t }),
      g && /* @__PURE__ */ e(an, { onSuccess: t }),
      y && /* @__PURE__ */ e(Dn, { onSuccess: t }),
      A && /* @__PURE__ */ e(cn, { onSuccess: t })
    ] }),
    k && /* @__PURE__ */ e("div", { className: "cedros-divider", children: /* @__PURE__ */ e("span", { children: "Or continue with" }) }),
    m && /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${n === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => o("login"),
            onKeyDown: h,
            "aria-selected": n === "login",
            "aria-controls": "cedros-tabpanel-login",
            tabIndex: n === "login" ? 0 : -1,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-register",
            className: `cedros-tab ${n === "register" ? "cedros-tab-active" : ""}`,
            onClick: () => o("register"),
            onKeyDown: h,
            "aria-selected": n === "register",
            "aria-controls": "cedros-tabpanel-register",
            tabIndex: n === "register" ? 0 : -1,
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "div",
        {
          role: "tabpanel",
          id: `cedros-tabpanel-${n}`,
          "aria-labelledby": `cedros-tab-${n}`,
          children: n === "login" ? /* @__PURE__ */ e(
            en,
            {
              onSuccess: t,
              onSwitchToRegister: () => o("register"),
              onForgotPassword: f === "reset" ? () => c("forgotPassword") : void 0
            }
          ) : /* @__PURE__ */ e(
            tn,
            {
              onSuccess: t,
              onSwitchToLogin: () => o("login")
            }
          )
        }
      )
    ] })
  ] });
}
class Wn extends Ys {
  constructor(r) {
    super(r), this.state = {
      hasError: !1,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(r) {
    return { hasError: !0, error: r };
  }
  componentDidCatch(r, s) {
    this.setState({ errorInfo: s }), process.env.NODE_ENV === "development" && (console.error("[Cedros Login] Error caught by ErrorBoundary:", r), console.error("[Cedros Login] Component stack:", s.componentStack)), this.props.onError?.(r, s);
  }
  handleRetry = () => {
    this.setState({
      hasError: !1,
      error: null,
      errorInfo: null
    });
  };
  render() {
    const { hasError: r, error: s, errorInfo: a } = this.state, { children: n, fallback: o, showDetails: l = !1 } = this.props;
    return r ? o || /* @__PURE__ */ e("div", { className: "cedros-error-boundary", role: "alert", "aria-live": "assertive", children: /* @__PURE__ */ i("div", { className: "cedros-error-boundary-content", children: [
      /* @__PURE__ */ i(
        "svg",
        {
          className: "cedros-error-boundary-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ e("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
            /* @__PURE__ */ e("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
          ]
        }
      ),
      /* @__PURE__ */ e("h2", { className: "cedros-error-boundary-title", children: "Something went wrong" }),
      /* @__PURE__ */ e("p", { className: "cedros-error-boundary-message", children: "We encountered an unexpected error. Please try again." }),
      l && s && /* @__PURE__ */ i("details", { className: "cedros-error-boundary-details", children: [
        /* @__PURE__ */ e("summary", { children: "Error details" }),
        /* @__PURE__ */ i("pre", { children: [
          s.toString(),
          a?.componentStack
        ] })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: this.handleRetry,
          children: "Try again"
        }
      )
    ] }) }) : n;
  }
}
function tc({ className: t = "", title: r = "Sign in to your account" }) {
  const { isModalOpen: s, closeModal: a } = se(), n = Q(null), o = Q(null), l = Q(a);
  if (I(() => {
    l.current = a;
  }, [a]), I(() => {
    if (!s) return;
    o.current = document.activeElement, n.current?.focus();
    const d = (p) => {
      if (p.key === "Escape" && l.current(), p.key === "Tab" && n.current) {
        const f = n.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), h = f[0], w = f[f.length - 1];
        p.shiftKey && document.activeElement === h ? (p.preventDefault(), w?.focus()) : !p.shiftKey && document.activeElement === w && (p.preventDefault(), h?.focus());
      }
    };
    document.addEventListener("keydown", d);
    const u = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", d), document.body.style.overflow = u, o.current instanceof HTMLElement && o.current.focus();
    };
  }, [s]), !s) return null;
  const c = (d) => {
    d.target === d.currentTarget && a();
  };
  return /* @__PURE__ */ e(
    "div",
    {
      className: `cedros-modal-backdrop ${t}`,
      onClick: c,
      role: "presentation",
      children: /* @__PURE__ */ i(
        "div",
        {
          ref: n,
          className: "cedros-modal",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "cedros-modal-title",
          tabIndex: -1,
          children: [
            /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
              /* @__PURE__ */ e("h2", { id: "cedros-modal-title", className: "cedros-modal-title", children: r }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  className: "cedros-modal-close",
                  onClick: a,
                  "aria-label": "Close",
                  children: /* @__PURE__ */ e("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ e(
                    "path",
                    {
                      d: "M18 6L6 18M6 6l12 12",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round"
                    }
                  ) })
                }
              )
            ] }),
            /* @__PURE__ */ e("div", { className: "cedros-modal-content", children: /* @__PURE__ */ e(Wn, { children: /* @__PURE__ */ e(_t, { onSuccess: a }) }) })
          ]
        }
      )
    }
  );
}
function rc({
  token: t,
  onSuccess: r,
  onLoginClick: s,
  className: a = ""
}) {
  const [n, o] = N(""), [l, c] = N(""), [d, u] = N(null), { resetPassword: p, isLoading: f, isSuccess: h, error: w, clearError: m } = is(), g = n === l, y = d?.isValid && g && n.length > 0, A = async (v) => {
    if (v.preventDefault(), !!y)
      try {
        await p(t, n), r?.();
      } catch {
      }
  };
  return h ? /* @__PURE__ */ i("div", { className: `cedros-reset-password-success ${a}`, children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ e("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ e(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e("h3", { className: "cedros-success-title", children: "Password reset successful" }),
    /* @__PURE__ */ e("p", { className: "cedros-success-message", children: "Your password has been reset. You can now log in with your new password." }),
    s && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: s,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ i("form", { className: `cedros-reset-password-form ${a}`, onSubmit: A, children: [
    /* @__PURE__ */ i("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ e("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ e(ae, { error: w, onDismiss: m }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      xe,
      {
        label: "New password",
        value: n,
        onChange: (v) => {
          o(v.target.value), u(on(v.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: u,
        disabled: f,
        autoComplete: "new-password",
        error: d && !d.isValid ? Object.values(d.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      xe,
      {
        label: "Confirm password",
        value: l,
        onChange: (v) => c(v.target.value),
        disabled: f,
        autoComplete: "new-password",
        error: l && !g ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: f || !y,
          children: f ? /* @__PURE__ */ i(te, { children: [
            /* @__PURE__ */ e(ee, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: s,
          disabled: f,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
function Ut({ org: t, size: r = "lg", className: s = "" }) {
  const a = Ot(t.logoUrl), n = r === "lg" ? "cedros-org-avatar-lg" : "", o = ["cedros-org-avatar", n, s].filter(Boolean).join(" "), l = ["cedros-org-avatar-placeholder", n, s].filter(Boolean).join(" ");
  return a ? /* @__PURE__ */ e(
    "img",
    {
      src: a,
      alt: t.name,
      className: o,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ e("div", { className: l, children: t.name[0]?.toUpperCase() || "?" });
}
function sc({
  orgs: t,
  activeOrg: r,
  isLoading: s = !1,
  onSelect: a,
  onCreateClick: n,
  className: o = "",
  placeholder: l = "Select organization"
}) {
  const [c, d] = N(!1), u = Q(null);
  I(() => {
    const w = (m) => {
      u.current && !u.current.contains(m.target) && d(!1);
    };
    return document.addEventListener("mousedown", w), () => document.removeEventListener("mousedown", w);
  }, []), I(() => {
    const w = (m) => {
      m.key === "Escape" && d(!1);
    };
    if (c)
      return document.addEventListener("keydown", w), () => document.removeEventListener("keydown", w);
  }, [c]);
  const p = C(
    (w) => {
      a(w), d(!1);
    },
    [a]
  ), f = C(() => {
    d(!1), n?.();
  }, [n]), h = C(() => {
    d((w) => !w);
  }, []);
  return s ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${o}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ e(ee, { size: "sm" }),
        /* @__PURE__ */ e("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { ref: u, className: `cedros-org-selector ${o}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: h,
        "aria-haspopup": "listbox",
        "aria-expanded": c,
        children: [
          r ? /* @__PURE__ */ i(te, { children: [
            /* @__PURE__ */ e(Ut, { org: r, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-name", children: r.name }),
            /* @__PURE__ */ e(tr, { role: r.membership.role })
          ] }) : /* @__PURE__ */ e("span", { className: "cedros-org-selector-placeholder", children: l }),
          /* @__PURE__ */ e(qn, { isOpen: c })
        ]
      }
    ),
    c && /* @__PURE__ */ i("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ e("ul", { className: "cedros-org-selector-list", children: t.map((w) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${w.id === r?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => p(w.id),
          role: "option",
          "aria-selected": w.id === r?.id,
          children: [
            /* @__PURE__ */ e(Ut, { org: w, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-item-name", children: w.name }),
            /* @__PURE__ */ e(tr, { role: w.membership.role }),
            w.id === r?.id && /* @__PURE__ */ e(_n, {})
          ]
        }
      ) }, w.id)) }),
      n && /* @__PURE__ */ i(te, { children: [
        /* @__PURE__ */ e("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: f,
            children: [
              /* @__PURE__ */ e(jn, {}),
              /* @__PURE__ */ e("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function tr({ role: t }) {
  return /* @__PURE__ */ e("span", { className: `cedros-org-role cedros-org-role-${t}`, children: t });
}
function qn({ isOpen: t }) {
  return /* @__PURE__ */ e(
    "svg",
    {
      className: `cedros-org-chevron ${t ? "cedros-org-chevron-open" : ""}`,
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ e(
        "path",
        {
          d: "M4 6L8 10L12 6",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function _n() {
  return /* @__PURE__ */ e(
    "svg",
    {
      className: "cedros-org-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ e(
        "path",
        {
          d: "M3 8L6 11L13 4",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function jn() {
  return /* @__PURE__ */ e(
    "svg",
    {
      className: "cedros-org-plus",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ e(
        "path",
        {
          d: "M8 3V13M3 8H13",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function $n() {
  return /* @__PURE__ */ e("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ e(
    "path",
    {
      d: "M5 5L15 15M15 5L5 15",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function zn() {
  return /* @__PURE__ */ e(
    "svg",
    {
      className: "cedros-org-check",
      width: "20",
      height: "20",
      viewBox: "0 0 20 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ e(
        "path",
        {
          d: "M4 10L8 14L16 5",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function Vn() {
  return /* @__PURE__ */ e("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ e(
    "path",
    {
      d: "M10 4V16M4 10H16",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Qn({
  orgs: t,
  activeOrg: r,
  isLoading: s,
  onSelect: a,
  onCreateClick: n
}) {
  return s ? /* @__PURE__ */ i("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ e(ee, {}),
    /* @__PURE__ */ e("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ i(te, { children: [
    t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ e("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ e("ul", { className: "cedros-org-switcher-list", children: t.map((o) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${o.id === r?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => a(o.id),
        children: [
          /* @__PURE__ */ e(Ut, { org: o }),
          /* @__PURE__ */ i("div", { className: "cedros-org-switcher-item-content", children: [
            /* @__PURE__ */ e("span", { className: "cedros-org-switcher-item-name", children: o.name }),
            /* @__PURE__ */ i("span", { className: "cedros-org-switcher-item-slug", children: [
              "@",
              o.slug
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "cedros-org-switcher-item-meta", children: [
            /* @__PURE__ */ e("span", { className: `cedros-org-role cedros-org-role-${o.membership.role}`, children: o.membership.role }),
            o.isPersonal && /* @__PURE__ */ e("span", { className: "cedros-org-personal-badge", children: "Personal" })
          ] }),
          o.id === r?.id && /* @__PURE__ */ e(zn, {})
        ]
      }
    ) }, o.id)) }),
    n && /* @__PURE__ */ i("button", { type: "button", className: "cedros-org-switcher-create", onClick: n, children: [
      /* @__PURE__ */ e(Vn, {}),
      /* @__PURE__ */ e("span", { children: "Create new organization" })
    ] })
  ] });
}
function Hn({ isLoading: t, onSubmit: r, onCancel: s }) {
  const [a, n] = N(""), [o, l] = N(""), [c, d] = N(null), u = C((f) => {
    n(f);
    const h = f.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    l(h);
  }, []), p = C(
    async (f) => {
      if (f.preventDefault(), d(null), !a.trim()) {
        d("Organization name is required");
        return;
      }
      if (!o.trim()) {
        d("Organization slug is required");
        return;
      }
      try {
        await r({ name: a.trim(), slug: o.trim() });
      } catch (h) {
        d(h.message || "Failed to create organization");
      }
    },
    [a, o, r]
  );
  return /* @__PURE__ */ i("form", { className: "cedros-org-create-form", onSubmit: p, children: [
    c && /* @__PURE__ */ e(ae, { error: c }),
    /* @__PURE__ */ i("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ e("label", { htmlFor: "org-name", className: "cedros-form-label", children: "Organization Name" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "org-name",
          type: "text",
          className: "cedros-form-input",
          value: a,
          onChange: (f) => u(f.target.value),
          placeholder: "My Organization",
          maxLength: 255,
          disabled: t,
          autoFocus: !0
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ e("label", { htmlFor: "org-slug", className: "cedros-form-label", children: "URL Slug" }),
      /* @__PURE__ */ i("div", { className: "cedros-form-input-prefix", children: [
        /* @__PURE__ */ e("span", { className: "cedros-form-prefix", children: "@" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "org-slug",
            type: "text",
            className: "cedros-form-input",
            value: o,
            onChange: (f) => l(f.target.value.toLowerCase()),
            placeholder: "my-organization",
            maxLength: 100,
            pattern: "[a-z0-9-]+",
            disabled: t
          }
        )
      ] }),
      /* @__PURE__ */ e("span", { className: "cedros-form-hint", children: "Only lowercase letters, numbers, and hyphens" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: s,
          disabled: t,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: t || !a.trim() || !o.trim(),
          children: t ? /* @__PURE__ */ e(ee, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function nc({
  isOpen: t,
  onClose: r,
  orgs: s,
  activeOrg: a,
  isLoading: n = !1,
  error: o,
  onSelect: l,
  onCreate: c,
  className: d = ""
}) {
  return t ? /* @__PURE__ */ e(
    Kn,
    {
      onClose: r,
      orgs: s,
      activeOrg: a,
      isLoading: n,
      error: o,
      onSelect: l,
      onCreate: c,
      className: d
    }
  ) : null;
}
function Kn({
  onClose: t,
  orgs: r,
  activeOrg: s,
  isLoading: a = !1,
  error: n,
  onSelect: o,
  onCreate: l,
  className: c
}) {
  const [d, u] = N("list"), p = Q(null), f = Q(null);
  I(() => (f.current = document.activeElement, p.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    f.current?.focus();
  }), []), I(() => {
    const g = (y) => {
      if (y.key === "Escape") {
        t();
        return;
      }
      if (y.key === "Tab" && p.current) {
        const A = p.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), v = A[0], k = A[A.length - 1];
        y.shiftKey ? document.activeElement === v && (y.preventDefault(), k?.focus()) : document.activeElement === k && (y.preventDefault(), v?.focus());
      }
    };
    return document.addEventListener("keydown", g), () => document.removeEventListener("keydown", g);
  }, [t]);
  const h = C(
    (g) => {
      g.target === g.currentTarget && t();
    },
    [t]
  ), w = C(
    (g) => {
      o(g), t();
    },
    [o, t]
  ), m = C(
    async (g) => {
      await l?.(g), t();
    },
    [l, t]
  );
  return /* @__PURE__ */ e("div", { className: "cedros-modal-backdrop", onClick: h, children: /* @__PURE__ */ i(
    "div",
    {
      ref: p,
      className: `cedros-modal cedros-org-switcher ${c}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ e("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: d === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-modal-close", onClick: t, "aria-label": "Close", children: /* @__PURE__ */ e($n, {}) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-modal-body", children: [
          n && /* @__PURE__ */ e(ae, { error: n }),
          d === "list" ? /* @__PURE__ */ e(
            Qn,
            {
              orgs: r,
              activeOrg: s,
              isLoading: a,
              onSelect: w,
              onCreateClick: l ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ e(
            Hn,
            {
              isLoading: a,
              onSubmit: m,
              onCancel: () => u("list")
            }
          )
        ] })
      ]
    }
  ) });
}
const Yn = ["owner", "admin", "member", "viewer"];
function Gn({
  members: t,
  currentUserId: r,
  isLoading: s = !1,
  error: a,
  canManage: n = !1,
  canChangeRoles: o = !1,
  onUpdateRole: l,
  onRemove: c,
  className: d = ""
}) {
  return s && t.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-member-list cedros-member-list-loading ${d}`, children: [
    /* @__PURE__ */ e(ee, {}),
    /* @__PURE__ */ e("span", { children: "Loading members..." })
  ] }) : a ? /* @__PURE__ */ e("div", { className: `cedros-member-list ${d}`, children: /* @__PURE__ */ e(ae, { error: a }) }) : t.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-member-list cedros-member-list-empty ${d}`, children: /* @__PURE__ */ e("p", { children: "No members found." }) }) : /* @__PURE__ */ e("div", { className: `cedros-member-list ${d}`, children: /* @__PURE__ */ i("table", { className: "cedros-member-table", children: [
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
      /* @__PURE__ */ e("th", { children: "Member" }),
      /* @__PURE__ */ e("th", { children: "Role" }),
      /* @__PURE__ */ e("th", { children: "Joined" }),
      (n || o) && /* @__PURE__ */ e("th", { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ e("tbody", { children: t.map((u) => /* @__PURE__ */ e(
      Jn,
      {
        member: u,
        isCurrentUser: u.userId === r,
        canManage: n,
        canChangeRoles: o,
        onUpdateRole: l,
        onRemove: c
      },
      u.id
    )) })
  ] }) });
}
function Jn({
  member: t,
  isCurrentUser: r,
  canManage: s,
  canChangeRoles: a,
  onUpdateRole: n,
  onRemove: o
}) {
  const [l, c] = N(!1), [d, u] = N(t.role), p = C(
    async (m) => {
      if (!(!n || m === t.role)) {
        c(!0);
        try {
          await n(t.userId, m), u(m);
        } catch {
          u(t.role);
        } finally {
          c(!1);
        }
      }
    },
    [t.userId, t.role, n]
  ), f = C(async () => {
    if (!(!o || !window.confirm(
      `Are you sure you want to remove ${t.user.name || t.user.email} from this organization?`
    ))) {
      c(!0);
      try {
        await o(t.userId);
      } finally {
        c(!1);
      }
    }
  }, [t.userId, t.user.name, t.user.email, o]), h = t.role === "owner", w = !r && !h;
  return /* @__PURE__ */ i("tr", { className: `cedros-member-row ${r ? "cedros-member-row-current" : ""}`, children: [
    /* @__PURE__ */ i("td", { className: "cedros-member-info", children: [
      /* @__PURE__ */ e(Xn, { user: t.user }),
      /* @__PURE__ */ i("div", { className: "cedros-member-details", children: [
        /* @__PURE__ */ i("span", { className: "cedros-member-name", children: [
          t.user.name || "Unknown",
          r && /* @__PURE__ */ e("span", { className: "cedros-member-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ e("span", { className: "cedros-member-email", children: t.user.email })
      ] })
    ] }),
    /* @__PURE__ */ e("td", { className: "cedros-member-role", children: a && w && n ? /* @__PURE__ */ e(
      "select",
      {
        value: d,
        onChange: (m) => p(m.target.value),
        disabled: l,
        className: "cedros-role-select",
        children: Yn.map((m) => /* @__PURE__ */ e("option", { value: m, children: m.charAt(0).toUpperCase() + m.slice(1) }, m))
      }
    ) : /* @__PURE__ */ e("span", { className: `cedros-role-badge cedros-role-badge-${t.role}`, children: t.role.charAt(0).toUpperCase() + t.role.slice(1) }) }),
    /* @__PURE__ */ e("td", { className: "cedros-member-joined", children: Zn(t.joinedAt) }),
    (s || a) && /* @__PURE__ */ e("td", { className: "cedros-member-actions", children: s && w && o && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger cedros-button-sm",
        onClick: f,
        disabled: l,
        "aria-label": `Remove ${t.user.name || t.user.email}`,
        children: l ? /* @__PURE__ */ e(ee, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function Xn({ user: t }) {
  const r = Ot(t.picture);
  if (r)
    return /* @__PURE__ */ e(
      "img",
      {
        src: r,
        alt: t.name || t.email || "Member",
        className: "cedros-member-avatar",
        referrerPolicy: "no-referrer"
      }
    );
  const s = (t.name?.[0] || t.email?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ e("div", { className: "cedros-member-avatar-placeholder", children: s });
}
function Zn(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
const eo = ["admin", "member", "viewer"];
function to({
  onSubmit: t,
  isLoading: r = !1,
  error: s,
  availableRoles: a = eo,
  defaultRole: n = "member",
  className: o = ""
}) {
  const [l, c] = N(""), [d, u] = N(n), [p, f] = N(null), [h, w] = N(!1), m = Q(null), g = Q(!0);
  I(() => (g.current = !0, () => {
    g.current = !1, m.current !== null && (window.clearTimeout(m.current), m.current = null);
  }), []);
  const y = C(
    async (A) => {
      A.preventDefault(), f(null), w(!1);
      const v = l.trim();
      if (!v) {
        f("Email is required");
        return;
      }
      if (!Zr(v)) {
        f("Please enter a valid email address");
        return;
      }
      try {
        await t(v, d), c(""), u(n), w(!0), m.current !== null && window.clearTimeout(m.current), m.current = window.setTimeout(() => {
          g.current && w(!1), m.current = null;
        }, 3e3);
      } catch {
      }
    },
    [l, d, n, t]
  );
  return /* @__PURE__ */ i("form", { className: `cedros-invite-form ${o}`, onSubmit: y, children: [
    (s || p) && /* @__PURE__ */ e(ae, { error: p ?? s ?? null }),
    h && /* @__PURE__ */ i("div", { className: "cedros-invite-success", role: "status", children: [
      /* @__PURE__ */ e(ro, {}),
      /* @__PURE__ */ e("span", { children: "Invitation sent successfully!" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-invite-form-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-form-group cedros-invite-email-group", children: [
        /* @__PURE__ */ e("label", { htmlFor: "invite-email", className: "cedros-form-label", children: "Email Address" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "invite-email",
            type: "email",
            className: "cedros-form-input",
            value: l,
            onChange: (A) => c(A.target.value),
            placeholder: "colleague@example.com",
            disabled: r,
            autoComplete: "email"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-form-group cedros-invite-role-group", children: [
        /* @__PURE__ */ e("label", { htmlFor: "invite-role", className: "cedros-form-label", children: "Role" }),
        /* @__PURE__ */ e(
          "select",
          {
            id: "invite-role",
            className: "cedros-form-select",
            value: d,
            onChange: (A) => u(A.target.value),
            disabled: r,
            children: a.map((A) => /* @__PURE__ */ e("option", { value: A, children: A.charAt(0).toUpperCase() + A.slice(1) }, A))
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary cedros-invite-submit",
          disabled: r || !l.trim(),
          children: r ? /* @__PURE__ */ e(ee, { size: "sm" }) : "Send Invite"
        }
      )
    ] }),
    /* @__PURE__ */ e("p", { className: "cedros-form-hint", children: "The invited user will receive an email with a link to join your organization." })
  ] });
}
function ro() {
  return /* @__PURE__ */ e(
    "svg",
    {
      className: "cedros-invite-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ e(
        "path",
        {
          d: "M3 8L6 11L13 5",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function so({
  invites: t,
  isLoading: r = !1,
  error: s,
  canManage: a = !1,
  onCancel: n,
  onResend: o,
  className: l = ""
}) {
  return r && t.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-invite-list cedros-invite-list-loading ${l}`, children: [
    /* @__PURE__ */ e(ee, {}),
    /* @__PURE__ */ e("span", { children: "Loading invites..." })
  ] }) : s ? /* @__PURE__ */ e("div", { className: `cedros-invite-list ${l}`, children: /* @__PURE__ */ e(ae, { error: s }) }) : t.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-invite-list cedros-invite-list-empty ${l}`, children: /* @__PURE__ */ e("p", { children: "No pending invites." }) }) : /* @__PURE__ */ e("div", { className: `cedros-invite-list ${l}`, children: /* @__PURE__ */ e("ul", { className: "cedros-invite-items", children: t.map((c) => /* @__PURE__ */ e(
    no,
    {
      invite: c,
      canManage: a,
      onCancel: n,
      onResend: o
    },
    c.id
  )) }) });
}
function no({ invite: t, canManage: r, onCancel: s, onResend: a }) {
  const [n, o] = N(!1), [l, c] = N(!1), d = Q(null), u = new Date(t.expiresAt) < /* @__PURE__ */ new Date(), p = C(async () => {
    if (!(!s || !window.confirm(
      `Are you sure you want to cancel the invite for ${t.email}?`
    ))) {
      o(!0);
      try {
        await s(t.id);
      } finally {
        o(!1);
      }
    }
  }, [t.id, t.email, s]), f = C(async () => {
    if (a) {
      o(!0), c(!1);
      try {
        await a(t.id), c(!0), d.current !== null && window.clearTimeout(d.current), d.current = window.setTimeout(() => {
          c(!1), d.current = null;
        }, 3e3);
      } finally {
        o(!1);
      }
    }
  }, [t.id, a]);
  return I(() => () => {
    d.current !== null && (window.clearTimeout(d.current), d.current = null);
  }, []), /* @__PURE__ */ i("li", { className: `cedros-invite-item ${u ? "cedros-invite-item-expired" : ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-invite-item-info", children: [
      /* @__PURE__ */ i("div", { className: "cedros-invite-item-main", children: [
        /* @__PURE__ */ e("span", { className: "cedros-invite-item-email", children: t.email }),
        /* @__PURE__ */ e("span", { className: `cedros-role-badge cedros-role-badge-${t.role}`, children: t.role.charAt(0).toUpperCase() + t.role.slice(1) }),
        u && /* @__PURE__ */ e("span", { className: "cedros-invite-expired-badge", children: "Expired" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-invite-item-meta", children: [
        /* @__PURE__ */ i("span", { className: "cedros-invite-item-date", children: [
          "Invited ",
          ds(t.createdAt)
        ] }),
        !u && /* @__PURE__ */ i("span", { className: "cedros-invite-item-expires", children: [
          "Expires ",
          oo(t.expiresAt)
        ] })
      ] })
    ] }),
    r && /* @__PURE__ */ i("div", { className: "cedros-invite-item-actions", children: [
      l && /* @__PURE__ */ e("span", { className: "cedros-invite-resend-success", children: "Sent!" }),
      a && !u && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: f,
          disabled: n,
          "aria-label": `Resend invite to ${t.email}`,
          children: n ? /* @__PURE__ */ e(ee, { size: "sm" }) : "Resend"
        }
      ),
      s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-danger cedros-button-sm",
          onClick: p,
          disabled: n,
          "aria-label": `Cancel invite for ${t.email}`,
          children: "Cancel"
        }
      )
    ] })
  ] });
}
function ds(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function oo(t) {
  const r = new Date(t), s = /* @__PURE__ */ new Date(), a = r.getTime() - s.getTime(), n = Math.ceil(a / (1e3 * 60 * 60 * 24));
  return n < 0 ? "expired" : n === 0 ? "today" : n === 1 ? "tomorrow" : n < 7 ? `in ${n} days` : ds(t);
}
function oc({
  sessions: t,
  isLoading: r = !1,
  error: s,
  onRevokeAll: a,
  className: n = ""
}) {
  const [o, l] = N(!1), [c, d] = N(!1), u = Q(null), p = $(() => t.filter((h) => !h.isCurrent).length, [t]), f = C(async () => {
    if (!a) return;
    const h = t.filter((m) => !m.isCurrent).length;
    if (!(h === 0 || !window.confirm(
      `Are you sure you want to sign out of ${h} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      l(!0), d(!1);
      try {
        await a(), d(!0), u.current !== null && window.clearTimeout(u.current), u.current = window.setTimeout(() => {
          d(!1), u.current = null;
        }, 3e3);
      } finally {
        l(!1);
      }
    }
  }, [a, t]);
  return I(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), r && t.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-session-list cedros-session-list-loading ${n}`, children: [
    /* @__PURE__ */ e(ee, {}),
    /* @__PURE__ */ e("span", { children: "Loading sessions..." })
  ] }) : s ? /* @__PURE__ */ e("div", { className: `cedros-session-list ${n}`, children: /* @__PURE__ */ e(ae, { error: s }) }) : t.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-session-list cedros-session-list-empty ${n}`, children: /* @__PURE__ */ e("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-session-list ${n}`, children: [
    c && /* @__PURE__ */ i("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ e(ho, {}),
      /* @__PURE__ */ e("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ e("ul", { className: "cedros-session-items", children: t.map((h) => /* @__PURE__ */ e(ao, { session: h }, h.id)) }),
    a && p > 0 && /* @__PURE__ */ e("div", { className: "cedros-session-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: f,
        disabled: o,
        children: o ? /* @__PURE__ */ i(te, { children: [
          /* @__PURE__ */ e(ee, { size: "sm" }),
          /* @__PURE__ */ e("span", { children: "Signing out..." })
        ] }) : `Sign out of ${p} other device${p > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function ao({ session: t }) {
  const r = io(t.userAgent), s = lo(t.expiresAt);
  return /* @__PURE__ */ i("li", { className: `cedros-session-item ${t.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ e(uo, { userAgent: t.userAgent }) }),
    /* @__PURE__ */ i("div", { className: "cedros-session-item-info", children: [
      /* @__PURE__ */ i("div", { className: "cedros-session-item-main", children: [
        /* @__PURE__ */ i("span", { className: "cedros-session-item-device", children: [
          r.browser,
          " on ",
          r.os
        ] }),
        t.isCurrent && /* @__PURE__ */ e("span", { className: "cedros-session-current-badge", children: "Current session" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-session-item-meta", children: [
        t.ipAddress && /* @__PURE__ */ i("span", { className: "cedros-session-item-ip", children: [
          "IP: ",
          t.ipAddress
        ] }),
        /* @__PURE__ */ i("span", { className: "cedros-session-item-created", children: [
          "Started ",
          co(t.createdAt)
        ] }),
        s && /* @__PURE__ */ e("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function io(t) {
  if (!t)
    return { browser: "Unknown browser", os: "Unknown device" };
  let r = "Unknown browser";
  t.includes("Chrome") && !t.includes("Edg") ? r = "Chrome" : t.includes("Safari") && !t.includes("Chrome") ? r = "Safari" : t.includes("Firefox") ? r = "Firefox" : t.includes("Edg") && (r = "Edge");
  let s = "Unknown device";
  return t.includes("Windows") ? s = "Windows" : t.includes("Mac") ? s = "macOS" : t.includes("Linux") ? s = "Linux" : t.includes("iPhone") || t.includes("iPad") ? s = "iOS" : t.includes("Android") && (s = "Android"), { browser: r, os: s };
}
function co(t) {
  const r = new Date(t), a = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), n = Math.floor(a / (1e3 * 60)), o = Math.floor(a / (1e3 * 60 * 60)), l = Math.floor(a / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n} minute${n > 1 ? "s" : ""} ago` : o < 24 ? `${o} hour${o > 1 ? "s" : ""} ago` : l < 7 ? `${l} day${l > 1 ? "s" : ""} ago` : r.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function lo(t) {
  const r = new Date(t), s = /* @__PURE__ */ new Date(), a = 3600 * 1e3;
  return r.getTime() - s.getTime() < a;
}
function uo({ userAgent: t }) {
  return t?.includes("iPhone") || t?.includes("iPad") || t?.includes("Android") ? /* @__PURE__ */ i(
    "svg",
    {
      className: "cedros-session-device-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ e("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("circle", { cx: "12", cy: "18", r: "1", fill: "currentColor" })
      ]
    }
  ) : /* @__PURE__ */ i(
    "svg",
    {
      className: "cedros-session-device-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ e("rect", { x: "2", y: "4", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M8 21H16", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
        /* @__PURE__ */ e("path", { d: "M12 18V21", stroke: "currentColor", strokeWidth: "1.5" })
      ]
    }
  );
}
function ho() {
  return /* @__PURE__ */ e(
    "svg",
    {
      className: "cedros-session-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ e(
        "path",
        {
          d: "M3 8L6 11L13 5",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function mo({
  words: t,
  onConfirm: r,
  className: s = ""
}) {
  const [a, n] = N(!1), [o, l] = N(!1), c = Q(null), d = Sn(t), u = C(async () => {
    try {
      await navigator.clipboard.writeText(t.join(" ")), n(!0), c.current !== null && window.clearTimeout(c.current), c.current = window.setTimeout(() => n(!1), 2e3);
    } catch {
    }
  }, [t]);
  I(() => () => {
    c.current !== null && (window.clearTimeout(c.current), c.current = null);
  }, []);
  const p = C(() => {
    o && r();
  }, [o, r]);
  return /* @__PURE__ */ i("div", { className: `cedros-recovery-phrase-display ${s}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ e("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-recovery-grid", children: d.map((f, h) => /* @__PURE__ */ e("div", { className: "cedros-word-group", children: f.map((w, m) => {
      const g = h * 4 + m + 1;
      return /* @__PURE__ */ i("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ i("span", { className: "cedros-word-number", children: [
          g,
          "."
        ] }),
        /* @__PURE__ */ e("span", { className: "cedros-word-text", children: w })
      ] }, g);
    }) }, h)) }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-secondary cedros-copy-btn",
        onClick: u,
        children: a ? "Copied!" : "Copy to Clipboard"
      }
    ),
    /* @__PURE__ */ e("div", { className: "cedros-recovery-security", children: /* @__PURE__ */ i("div", { className: "cedros-warning-box", children: [
      /* @__PURE__ */ e(
        "svg",
        {
          className: "cedros-warning-icon",
          width: "20",
          height: "20",
          viewBox: "0 0 20 20",
          fill: "none",
          "aria-hidden": "true",
          children: /* @__PURE__ */ e(
            "path",
            {
              d: "M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-warning-content", children: [
        /* @__PURE__ */ e("strong", { children: "Security Warning" }),
        /* @__PURE__ */ i("ul", { children: [
          /* @__PURE__ */ e("li", { children: "Never share this phrase with anyone" }),
          /* @__PURE__ */ e("li", { children: "Store it offline in a secure location" }),
          /* @__PURE__ */ e("li", { children: "Anyone with this phrase can access your wallet" }),
          /* @__PURE__ */ e("li", { children: "Cedros cannot recover this phrase for you" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ i("div", { className: "cedros-recovery-confirm", children: [
      /* @__PURE__ */ i("label", { className: "cedros-checkbox-label", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: o,
            onChange: (f) => l(f.target.checked),
            className: "cedros-checkbox"
          }
        ),
        /* @__PURE__ */ e("span", { children: "I have written down and securely stored my recovery phrase" })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: p,
          disabled: !o,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function po({
  onSubmit: t,
  onCancel: r,
  isSubmitting: s = !1,
  error: a,
  className: n = ""
}) {
  const [o, l] = N(Array(he).fill("")), [c, d] = N(null), [u, p] = N([]), [f, h] = N(null), w = Qr(), m = Q(null), g = C(
    (b, x) => {
      const M = [...o];
      if (M[b] = x.toLowerCase().trim(), l(M), x.length > 0) {
        const E = En(x, 5);
        p(E);
      } else
        p([]);
      h(null);
    },
    [o]
  ), y = C((b) => {
    d(b), p([]);
  }, []), A = C(
    (b) => {
      const x = o[b];
      x && !$e(x) && h(`Word ${b + 1} is not in the wordlist`), m.current !== null && window.clearTimeout(m.current), m.current = window.setTimeout(() => {
        c === b && p([]);
      }, 200);
    },
    [o, c]
  );
  I(() => () => {
    m.current !== null && (window.clearTimeout(m.current), m.current = null);
  }, []);
  const v = C(
    (b) => {
      if (c !== null) {
        const x = [...o];
        x[c] = b, l(x), p([]), document.querySelector(
          `[data-word-index="${c + 1}"]`
        )?.focus();
      }
    },
    [c, o]
  ), k = C((b) => {
    const x = b.clipboardData.getData("text"), M = Pn(x);
    M.length === he && (b.preventDefault(), l(M), h(null));
  }, []), P = C(
    (b) => {
      if (b.preventDefault(), o.filter((E) => !E).length > 0) {
        h(`Please enter all ${he} words`);
        return;
      }
      const M = o.map((E, D) => ({ word: E, index: D + 1 })).filter(({ word: E }) => !$e(E));
      if (M.length > 0) {
        h(`Invalid words: ${M.map((E) => `#${E.index}`).join(", ")}`);
        return;
      }
      if (!as(o)) {
        h("Invalid recovery phrase - please check your words");
        return;
      }
      t(o);
    },
    [o, t]
  ), S = a || f;
  return /* @__PURE__ */ i(
    "form",
    {
      className: `cedros-recovery-phrase-input ${n}`,
      onSubmit: P,
      onPaste: k,
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ e("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-word-inputs", children: Array.from({ length: he }, (b, x) => /* @__PURE__ */ i("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ i("label", { className: "cedros-word-label", children: [
            x + 1,
            "."
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${o[x] && !$e(o[x]) ? "cedros-word-invalid" : o[x] && $e(o[x]) ? "cedros-word-valid" : ""}`,
              value: o[x],
              onChange: (M) => g(x, M.target.value),
              onFocus: () => y(x),
              onBlur: () => A(x),
              "data-word-index": x,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: s,
              "aria-label": `Word ${x + 1}`
            }
          )
        ] }, x)) }),
        c !== null && u.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-suggestions", role: "listbox", id: `${w}-suggestions`, children: u.map((b) => /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => v(b),
            role: "option",
            children: b
          },
          b
        )) }),
        S && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: S }),
        /* @__PURE__ */ i("div", { className: "cedros-recovery-input-actions", children: [
          r && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-secondary",
              onClick: r,
              disabled: s,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "submit",
              className: "cedros-button cedros-button-primary",
              disabled: s,
              children: s ? "Recovering..." : "Recover Wallet"
            }
          )
        ] })
      ]
    }
  );
}
function ac({ capabilities: t, className: r = "" }) {
  if (t.allSupported)
    return null;
  const s = zs(t), a = Vs();
  return /* @__PURE__ */ i("div", { className: `cedros-capability-warning ${r}`, role: "alert", children: [
    /* @__PURE__ */ i("div", { className: "cedros-warning-header", children: [
      /* @__PURE__ */ e(
        "svg",
        {
          className: "cedros-warning-icon",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          "aria-hidden": "true",
          children: /* @__PURE__ */ e(
            "path",
            {
              d: "M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        }
      ),
      /* @__PURE__ */ e("h3", { className: "cedros-warning-title", children: "Wallet Feature Unavailable" })
    ] }),
    /* @__PURE__ */ e("p", { className: "cedros-warning-message", children: s }),
    /* @__PURE__ */ i("div", { className: "cedros-capability-details", children: [
      /* @__PURE__ */ e("h4", { children: "Browser Compatibility" }),
      /* @__PURE__ */ i("p", { children: [
        "Detected: ",
        a.browser,
        " ",
        a.version,
        a.likelySupported ? " (likely supported)" : " (may not be supported)"
      ] }),
      /* @__PURE__ */ e("h4", { children: "Required Features" }),
      /* @__PURE__ */ i("ul", { className: "cedros-capability-list", children: [
        /* @__PURE__ */ i("li", { className: t.webCrypto ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Web Crypto API: ",
          t.webCrypto ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: t.aesGcm ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "AES-GCM Encryption: ",
          t.aesGcm ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: t.hkdf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "HKDF Key Derivation: ",
          t.hkdf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: t.webAuthn ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn/Passkeys: ",
          t.webAuthn ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: t.webAuthnPrf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn PRF Extension: ",
          t.webAuthnPrf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: t.argon2 ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Argon2 Password Hashing: ",
          t.argon2 ? "Available" : "Missing"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-capability-help", children: [
      /* @__PURE__ */ e("h4", { children: "Recommended Browsers" }),
      /* @__PURE__ */ i("ul", { children: [
        /* @__PURE__ */ e("li", { children: "Chrome 116+ on Windows, macOS, or Android" }),
        /* @__PURE__ */ e("li", { children: "Safari 17+ on macOS or iOS" }),
        /* @__PURE__ */ e("li", { children: "Edge 116+ on Windows" })
      ] }),
      /* @__PURE__ */ e("p", { className: "cedros-capability-note", children: "A platform authenticator (Touch ID, Face ID, or Windows Hello) is required." })
    ] })
  ] });
}
const fo = ["share_c_only", "full_seed", "none"];
function go(t) {
  return t && fo.includes(t) ? t : "share_c_only";
}
const wo = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function us() {
  const t = Le(), [r, s] = N(null), [a, n] = N(!!t), [o, l] = N(null), c = $(() => t ? new ie({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts
  }) : null, [t]), d = C(async () => {
    if (c) {
      n(!0), l(null);
      try {
        const u = await c.get("/discovery");
        u.wallet ? s({
          enabled: u.wallet.enabled,
          recoveryMode: go(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const p = u instanceof Error ? u.message : "Failed to fetch wallet config";
        l(p), s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        n(!1);
      }
    }
  }, [c]);
  return I(() => {
    c && d();
  }, [c, d]), t ? {
    walletEnabled: r?.enabled ?? !1,
    recoveryMode: r?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: r?.unlockTtlSeconds ?? 900,
    isLoading: a,
    error: o,
    refetch: d
  } : wo;
}
function yo() {
  const { user: t } = se(), { enroll: r } = Ie(), { recoveryMode: s } = us(), [a, n] = N({ step: "idle" }), [o, l] = N(!1), c = Q([]), d = C(() => {
    Wr(...c.current), c.current = [];
  }, []);
  I(() => () => {
    d();
  }, [d]);
  const u = C(
    async (m, g, y, A) => {
      n({ step: "generating_seed" });
      const v = Qs();
      c.current.push(v), n({ step: "splitting_shares" });
      const { shareA: k, shareB: P, shareC: S } = Kr(v);
      c.current.push(k, P, S), n({ step: "encrypting_shares" });
      const b = await qr(k, _r(g)), x = Yr(v), M = Gr(x);
      n({ step: "uploading" });
      const E = {
        solanaPubkey: M,
        shareAAuthMethod: m,
        shareACiphertext: b.ciphertext,
        shareANonce: b.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: ye(P)
      };
      if (m === "password") {
        if (!y) throw new Error("KDF salt required for password method");
        E.shareAKdfSalt = ye(y), E.shareAKdfParams = He;
      }
      if (m === "passkey" && A && (E.prfSalt = A), await r(E), s === "none")
        d(), n({
          step: "complete",
          solanaPubkey: M
        });
      else {
        const D = s === "full_seed" ? kn(v) : An(Qe(S));
        n({
          step: "showing_recovery",
          recoveryPhrase: D,
          solanaPubkey: M
        });
      }
    },
    [r, s, d]
  ), p = C(
    async (m) => {
      if (!t) {
        n({ step: "error", error: "User not authenticated" });
        return;
      }
      l(!0), d();
      try {
        const g = jr(), y = await Jr(m, g, He);
        c.current.push(y), await u("password", y, g);
      } catch (g) {
        n({
          step: "error",
          error: g instanceof Error ? g.message : "Enrollment failed"
        });
      } finally {
        l(!1);
      }
    },
    [t, d, u]
  ), f = C(async () => {
    if (!t) {
      n({ step: "error", error: "User not authenticated" });
      return;
    }
    l(!0), d();
    try {
      const m = $r(), g = ye(m);
      n({ step: "registering_passkey" });
      let y;
      try {
        const v = new TextEncoder().encode(t.id), k = t.name ?? t.email ?? "User", P = t.email ?? t.id;
        y = (await Hs(
          v,
          P,
          k,
          m
        )).prfOutput;
      } catch (v) {
        if (v?.name !== "InvalidStateError")
          throw v;
        y = (await Ft(g)).prfOutput;
      }
      c.current.push(y);
      const A = await zr(y, m);
      c.current.push(A), await u("passkey", A, void 0, g);
    } catch (m) {
      n({
        step: "error",
        error: m instanceof Error ? m.message : "Enrollment failed"
      });
    } finally {
      l(!1);
    }
  }, [t, d, u]), h = C(() => {
    const m = a.solanaPubkey;
    d(), n({
      step: "complete",
      solanaPubkey: m
    });
  }, [a.solanaPubkey, d]), w = C(() => {
    d(), n({ step: "idle" }), l(!1);
  }, [d]);
  return {
    state: a,
    startEnrollmentWithPassword: p,
    startEnrollmentWithPasskey: f,
    confirmRecoveryPhrase: h,
    cancel: w,
    isEnrolling: o
  };
}
function bo({
  onComplete: t,
  onCancel: r,
  className: s = "",
  forceAuthMethod: a
}) {
  const { user: n } = se(), {
    state: o,
    startEnrollmentWithPassword: l,
    startEnrollmentWithPasskey: c,
    confirmRecoveryPhrase: d,
    cancel: u,
    isEnrolling: p
  } = yo(), f = () => a || "password", [h, w] = N(f), [m, g] = N(""), [y, A] = N(""), [v, k] = N(null);
  I(() => {
    w(f());
  }, [n?.id, a]);
  const P = C(
    async (M) => {
      if (M.preventDefault(), m !== y) {
        k("Passwords do not match");
        return;
      }
      if (m.length < 8) {
        k("Password must be at least 8 characters");
        return;
      }
      k(null), await l(m);
    },
    [m, y, l]
  ), S = C(async () => {
    await c();
  }, [c]), b = C(() => {
    d(), o.solanaPubkey && t?.(o.solanaPubkey);
  }, [d, o.solanaPubkey, t]), x = C(() => {
    u(), r?.();
  }, [u, r]);
  return o.step === "generating_seed" || o.step === "splitting_shares" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ e("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ e("p", { children: "Generating secure wallet..." })
  ] }) }) : o.step === "encrypting_shares" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ e("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ e("p", { children: "Encrypting wallet shares..." })
  ] }) }) : o.step === "registering_passkey" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ e("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: /* @__PURE__ */ i("div", { className: "cedros-passkey-prompt", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-passkey-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ e(
            "rect",
            {
              x: "8",
              y: "16",
              width: "32",
              height: "24",
              rx: "4",
              stroke: "currentColor",
              strokeWidth: "2"
            }
          ),
          /* @__PURE__ */ e("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ e("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
        ]
      }
    ),
    /* @__PURE__ */ e("h3", { children: "Authenticate with Passkey" }),
    /* @__PURE__ */ e("p", { children: "Follow your browser's prompt to use your passkey." })
  ] }) }) }) : o.step === "uploading" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ e("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ e("p", { children: "Saving wallet..." })
  ] }) }) : o.step === "showing_recovery" && o.recoveryPhrase ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ e(mo, { words: o.recoveryPhrase, onConfirm: b }) }) : o.step === "complete" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-complete", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ e("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ e(
            "path",
            {
              d: "M16 24l6 6 12-12",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e("h3", { children: "Wallet Created!" }),
    /* @__PURE__ */ i("p", { className: "cedros-pubkey", children: [
      /* @__PURE__ */ e("strong", { children: "Address:" }),
      " ",
      o.solanaPubkey
    ] }),
    /* @__PURE__ */ e("p", { children: "Your non-custodial Solana wallet is ready to use." })
  ] }) }) : o.step === "error" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-error", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-error-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ e("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ e(
            "path",
            {
              d: "M24 16v12m0 6h.01",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e("h3", { children: "Enrollment Failed" }),
    /* @__PURE__ */ e("p", { className: "cedros-error-message", children: o.error }),
    /* @__PURE__ */ i("div", { className: "cedros-error-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: x,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: () => u(),
          children: "Try Again"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-enrollment ${s}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-enrollment-header", children: [
      /* @__PURE__ */ e("h2", { children: "Create Wallet" }),
      /* @__PURE__ */ i("p", { children: [
        "Secure your wallet with a ",
        h === "passkey" ? "passkey" : "password",
        "."
      ] })
    ] }),
    !a && /* @__PURE__ */ i("div", { className: "cedros-auth-method-selector", children: [
      /* @__PURE__ */ i("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "password",
            checked: h === "password",
            onChange: () => w("password"),
            disabled: p
          }
        ),
        /* @__PURE__ */ e("span", { children: "Password" })
      ] }),
      /* @__PURE__ */ i("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "passkey",
            checked: h === "passkey",
            onChange: () => w("passkey"),
            disabled: p
          }
        ),
        /* @__PURE__ */ e("span", { children: "Passkey" })
      ] })
    ] }),
    h === "password" && /* @__PURE__ */ i("form", { onSubmit: P, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ e(
        xe,
        {
          label: "Password",
          value: m,
          onChange: (M) => g(M.target.value),
          showStrengthMeter: !0,
          disabled: p,
          required: !0,
          minLength: 8,
          placeholder: "Enter a strong password"
        }
      ),
      /* @__PURE__ */ e(
        xe,
        {
          label: "Confirm Password",
          value: y,
          onChange: (M) => A(M.target.value),
          error: v ?? void 0,
          disabled: p,
          required: !0,
          minLength: 8,
          placeholder: "Confirm your password"
        }
      ),
      /* @__PURE__ */ e("div", { className: "cedros-password-info", children: /* @__PURE__ */ e("p", { children: "This password will be used to sign transactions." }) }),
      /* @__PURE__ */ i("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: x,
            disabled: p,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: p || !m || !y,
            children: p ? "Creating..." : "Continue"
          }
        )
      ] })
    ] }),
    h === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
        /* @__PURE__ */ i(
          "svg",
          {
            className: "cedros-passkey-icon",
            width: "48",
            height: "48",
            viewBox: "0 0 48 48",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ e(
                "rect",
                {
                  x: "8",
                  y: "16",
                  width: "32",
                  height: "24",
                  rx: "4",
                  stroke: "currentColor",
                  strokeWidth: "2"
                }
              ),
              /* @__PURE__ */ e("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
              /* @__PURE__ */ e("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
            ]
          }
        ),
        /* @__PURE__ */ e("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." }),
        /* @__PURE__ */ e("p", { children: "You'll use the same passkey to sign transactions." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: x,
            disabled: p,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: S,
            disabled: p,
            children: p ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] })
  ] });
}
function vo() {
  const { user: t } = se(), { signTransaction: r } = Ie(), [s, a] = N(!1), [n, o] = N(null), l = C(
    async (d, u) => {
      if (!t) {
        const p = "User not authenticated";
        throw o(p), new Error(p);
      }
      a(!0), o(null);
      try {
        const p = {
          transaction: ye(d),
          ...u ? { credential: Ks(u) } : {}
        }, f = await r(p);
        return Vr(f.signature);
      } catch (p) {
        const f = p instanceof Error ? p.message : "Signing failed";
        throw o(f), p;
      } finally {
        a(!1);
      }
    },
    [t, r]
  ), c = C(() => o(null), []);
  return {
    signTransaction: l,
    isSigning: s,
    error: n,
    clearError: c
  };
}
function Ao() {
  const { getMaterial: t } = Ie(), [r, s] = N(!1), [a, n] = N(null), o = C(async () => {
    s(!0), n(null);
    try {
      const c = await t();
      if (!c)
        throw new Error("No wallet enrolled");
      if (c.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!c.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const d = await Ft(c.prfSalt);
      return {
        type: "prfOutput",
        prfOutput: ye(d.prfOutput)
      };
    } catch (c) {
      const d = c instanceof Error ? c.message : "Passkey authentication failed";
      return n(d), null;
    } finally {
      s(!1);
    }
  }, [t]), l = C(() => n(null), []);
  return {
    getPasskeyCredential: o,
    isAuthenticating: r,
    error: a,
    clearError: l
  };
}
function No({
  mode: t,
  isLoading: r = !1,
  error: s,
  onPrompt: a,
  onRetry: n,
  onCancel: o,
  title: l,
  description: c,
  className: d = ""
}) {
  const u = C(() => {
    r || a?.();
  }, [r, a]), p = C(() => {
    n?.();
  }, [n]), f = t === "register" ? "Set Up Passkey" : "Verify with Passkey", h = t === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ i("div", { className: `cedros-passkey-prompt ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-passkey-icon", children: r ? /* @__PURE__ */ e(Co, {}) : s ? /* @__PURE__ */ e(Eo, {}) : /* @__PURE__ */ e(ko, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-passkey-title", children: l ?? f }),
    /* @__PURE__ */ e("p", { className: "cedros-passkey-description", children: c ?? h }),
    s && /* @__PURE__ */ e("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ e("p", { children: s }) }),
    /* @__PURE__ */ e("div", { className: "cedros-passkey-actions", children: s ? /* @__PURE__ */ i(te, { children: [
      n && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: p,
          children: "Try Again"
        }
      ),
      o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: o,
          children: "Cancel"
        }
      )
    ] }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: u,
          disabled: r,
          children: r ? /* @__PURE__ */ i(te, { children: [
            /* @__PURE__ */ e("span", { className: "cedros-button-spinner", "aria-hidden": "true" }),
            "Waiting for passkey..."
          ] }) : t === "register" ? "Create Passkey" : "Use Passkey"
        }
      ),
      o && !r && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: o,
          children: "Cancel"
        }
      )
    ] }) }),
    r && /* @__PURE__ */ i("p", { className: "cedros-passkey-hint", children: [
      "Follow the prompts on your device to ",
      t === "register" ? "create" : "verify",
      " your passkey."
    ] })
  ] });
}
function ko() {
  return /* @__PURE__ */ i(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ e("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ e("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ e("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ e("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ e("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ e("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ e("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ e("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ e("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
function Co() {
  return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ e("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function Eo() {
  return /* @__PURE__ */ i(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ e("path", { d: "M12 8v4M12 16h.01" })
      ]
    }
  );
}
function So({
  onUnlock: t,
  onCancel: r,
  showCancel: s = !0,
  authMethod: a,
  className: n = ""
}) {
  se();
  const { unlock: o, getMaterial: l, isLoading: c } = Ie(), { getPasskeyCredential: d, isAuthenticating: u } = Ao(), [p, f] = N("idle"), [h, w] = N(a ?? null), [m, g] = N(""), [y, A] = N(null);
  I(() => {
    a !== void 0 && w(a);
  }, [a]);
  const v = h === "password", k = h === "passkey", P = C(async () => {
    if (f("credential"), A(null), !h)
      try {
        const L = await l();
        L ? w(L.shareAAuthMethod) : (A("No wallet enrolled"), f("error"));
      } catch (L) {
        A(L instanceof Error ? L.message : "Failed to get wallet info"), f("error");
      }
  }, [h, l]), S = C(
    async (L) => {
      L.preventDefault(), A(null), f("unlocking");
      try {
        let T;
        if (v)
          T = { type: "password", password: m };
        else
          throw new Error("Invalid auth method");
        await o(T), f("unlocked"), t?.();
      } catch (T) {
        A(T instanceof Error ? T.message : "Failed to unlock wallet"), f("error");
      }
    },
    [v, m, o, t]
  ), b = C(async () => {
    A(null), f("unlocking");
    try {
      const L = await d();
      if (!L) {
        f("credential");
        return;
      }
      await o(L), f("unlocked"), t?.();
    } catch (L) {
      A(L instanceof Error ? L.message : "Failed to unlock wallet"), f("error");
    }
  }, [d, o, t]), x = C(() => {
    g(""), f("idle"), A(null), r?.();
  }, [r]), M = C(() => {
    g(""), f("credential"), A(null);
  }, []), E = c || u, D = () => {
    switch (p) {
      case "idle":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Po, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Locked" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Unlock your wallet to sign transactions." }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary",
              onClick: P,
              children: "Unlock Wallet"
            }
          )
        ] });
      case "credential":
        return v ? /* @__PURE__ */ i("form", { className: "cedros-wallet-unlock-form", onSubmit: S, children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ e(
            xe,
            {
              label: "Password",
              value: m,
              onChange: (L) => g(L.target.value),
              disabled: E,
              autoComplete: "current-password",
              error: y ?? void 0
            }
          ),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary",
                disabled: E || m.length === 0,
                children: E ? "Unlocking..." : "Unlock"
              }
            ),
            s && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: x,
                disabled: E,
                children: "Cancel"
              }
            )
          ] })
        ] }) : k ? /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ e(
            No,
            {
              mode: "authenticate",
              isLoading: E,
              error: y ?? void 0,
              onPrompt: b,
              onRetry: b,
              onCancel: s ? x : void 0
            }
          )
        ] }) : /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ e(ee, { size: "xl" }),
          /* @__PURE__ */ e("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(ee, { size: "xl" }) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(xo, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Lo, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: y ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: M,
                children: "Try Again"
              }
            ),
            s && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: x,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ e("div", { className: `cedros-wallet-unlock ${n}`, children: D() });
}
function Po() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ e(
      "rect",
      {
        x: "10",
        y: "22",
        width: "28",
        height: "20",
        rx: "4",
        stroke: "currentColor",
        strokeWidth: "2",
        fill: "var(--cedros-muted, #f3f4f6)"
      }
    ),
    /* @__PURE__ */ e("path", { d: "M16 22V16a8 8 0 1 1 16 0v6", stroke: "currentColor", strokeWidth: "2", fill: "none" }),
    /* @__PURE__ */ e("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
  ] });
}
function xo() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ e(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "2",
        fill: "var(--cedros-success-light, #dcfce7)"
      }
    ),
    /* @__PURE__ */ e(
      "path",
      {
        d: "M16 24l6 6 10-10",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "3",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none"
      }
    )
  ] });
}
function Lo() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ e(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "2",
        fill: "var(--cedros-destructive-light, #fee2e2)"
      }
    ),
    /* @__PURE__ */ e(
      "path",
      {
        d: "M24 16v10M24 30v2",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "3",
        strokeLinecap: "round"
      }
    )
  ] });
}
function To() {
  const { recover: t, getShareBForRecovery: r } = Ie(), { recoveryMode: s } = us(), [a, n] = N({ step: "idle" }), [o, l] = N(!1), c = Q([]), d = C(() => {
    Wr(...c.current), c.current = [];
  }, []);
  I(() => () => {
    d();
  }, [d]);
  const u = C(
    async (f, h, w) => {
      l(!0), d();
      try {
        if (n({ step: "validating" }), !as(f))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let m;
        if (s === "share_c_only") {
          const M = Nn(f);
          c.current.push(M);
          const E = ye(M), D = await r({ shareC: E }), L = Vr(D.shareB);
          c.current.push(L), m = rn(Qe(L), Qe(M)), c.current.push(m);
        } else
          m = Cn(f), c.current.push(m);
        const g = Yr(m), y = Gr(g), { shareA: A, shareB: v } = Kr(m);
        c.current.push(A, v), n({ step: "encrypting" });
        let k, P, S;
        if (h === "passkey") {
          const M = $r();
          S = ye(M);
          const E = await Ft(S);
          c.current.push(E.prfOutput), k = await zr(E.prfOutput, M), c.current.push(k);
        } else
          P = jr(), k = await Jr(w, P, He), c.current.push(k);
        const b = await qr(A, _r(k));
        n({ step: "uploading" });
        const x = {
          solanaPubkey: y,
          shareAAuthMethod: h,
          shareACiphertext: b.ciphertext,
          shareANonce: b.nonce,
          shareB: ye(v)
        };
        h === "password" && (x.shareAKdfSalt = ye(P), x.shareAKdfParams = He), h === "passkey" && (x.prfSalt = S), await t(x), d(), n({ step: "complete" });
      } catch (m) {
        d(), n({
          step: "error",
          error: m instanceof Error ? m.message : "Recovery failed"
        });
      } finally {
        l(!1);
      }
    },
    [t, r, s, d]
  ), p = C(() => {
    d(), n({ step: "idle" }), l(!1);
  }, [d]);
  return {
    state: a,
    startRecovery: u,
    cancel: p,
    isRecovering: o
  };
}
function Do({
  onComplete: t,
  onCancel: r,
  className: s = "",
  defaultAuthMethod: a = "password"
}) {
  const { state: n, startRecovery: o, cancel: l, isRecovering: c } = To(), [d, u] = N([]), [p, f] = N(!1), [h, w] = N(a), [m, g] = N(""), [y, A] = N(""), [v, k] = N(null), P = C((E) => {
    u(E), f(!0);
  }, []), S = C(
    async (E) => {
      if (E.preventDefault(), k(null), h !== "passkey") {
        if (m !== y) {
          k("Passwords do not match");
          return;
        }
        if (h === "password" && m.length < 8) {
          k("Password must be at least 8 characters");
          return;
        }
      }
      await o(d, h, m);
    },
    [d, h, m, y, o]
  ), b = C(() => {
    l(), u([]), f(!1), g(""), A(""), r?.();
  }, [l, r]), x = C(() => {
    f(!1), g(""), A("");
  }, []), M = C(() => {
    t?.();
  }, [t]);
  return n.step === "validating" || n.step === "encrypting" || n.step === "uploading" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(Mo, {}) }),
    /* @__PURE__ */ i("h3", { className: "cedros-wallet-recovery-title", children: [
      n.step === "validating" && "Validating Recovery Phrase",
      n.step === "encrypting" && "Encrypting Wallet",
      n.step === "uploading" && "Saving to Server"
    ] }),
    /* @__PURE__ */ i("p", { className: "cedros-wallet-recovery-description", children: [
      n.step === "validating" && "Checking your recovery phrase...",
      n.step === "encrypting" && "Securing your wallet with new encryption...",
      n.step === "uploading" && "Uploading encrypted wallet data..."
    ] })
  ] }) }) : n.step === "complete" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-success", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(Ro, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Wallet Recovered" }),
    /* @__PURE__ */ i("p", { className: "cedros-wallet-recovery-description", children: [
      "Your wallet has been successfully recovered and secured with your new",
      " ",
      h === "passkey" ? "passkey" : "password",
      "."
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: M,
        children: "Done"
      }
    ) })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(Bo, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: n.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: b,
        children: "Start Over"
      }
    ) })
  ] }) }) : p ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("form", { className: "cedros-wallet-recovery-credential", onSubmit: S, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Set New Security" }),
      /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: "Choose how to secure your recovered wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-auth-method-selector", children: [
      /* @__PURE__ */ i("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "password",
            checked: h === "password",
            onChange: () => w("password"),
            disabled: c
          }
        ),
        /* @__PURE__ */ e("span", { children: "Password" })
      ] }),
      /* @__PURE__ */ i("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "passkey",
            checked: h === "passkey",
            onChange: () => w("passkey"),
            disabled: c
          }
        ),
        /* @__PURE__ */ e("span", { children: "Passkey" })
      ] })
    ] }),
    h === "password" && /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ e("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: m,
            onChange: (E) => g(E.target.value),
            disabled: c,
            minLength: 8,
            placeholder: "Enter a strong password"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ e("label", { htmlFor: "recovery-password-confirm", className: "cedros-label", children: "Confirm Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "recovery-password-confirm",
            type: "password",
            className: "cedros-input",
            value: y,
            onChange: (E) => A(E.target.value),
            disabled: c,
            "aria-invalid": v ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        v && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: v })
      ] })
    ] }),
    h === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ e(Uo, {}),
      /* @__PURE__ */ e("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: x,
          disabled: c,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: c || h !== "passkey" && (m.length === 0 || y.length === 0),
          children: c ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ e(
      po,
      {
        onSubmit: P,
        onCancel: b,
        isSubmitting: !1
      }
    )
  ] }) });
}
function Mo() {
  return /* @__PURE__ */ i(
    "svg",
    {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48",
      fill: "none",
      "aria-hidden": "true",
      className: "cedros-spinner",
      children: [
        /* @__PURE__ */ e(
          "circle",
          {
            cx: "24",
            cy: "24",
            r: "20",
            stroke: "var(--cedros-muted, #e5e7eb)",
            strokeWidth: "3",
            fill: "none"
          }
        ),
        /* @__PURE__ */ e(
          "path",
          {
            d: "M24 4a20 20 0 0 1 20 20",
            stroke: "var(--cedros-primary, #6366f1)",
            strokeWidth: "3",
            strokeLinecap: "round",
            fill: "none"
          }
        )
      ]
    }
  );
}
function Ro() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ e(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "2",
        fill: "var(--cedros-success-light, #dcfce7)"
      }
    ),
    /* @__PURE__ */ e(
      "path",
      {
        d: "M16 24l6 6 10-10",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "3",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none"
      }
    )
  ] });
}
function Bo() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ e(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "2",
        fill: "var(--cedros-destructive-light, #fee2e2)"
      }
    ),
    /* @__PURE__ */ e(
      "path",
      {
        d: "M24 16v10M24 30v2",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "3",
        strokeLinecap: "round"
      }
    )
  ] });
}
function Uo() {
  return /* @__PURE__ */ i(
    "svg",
    {
      className: "cedros-passkey-icon",
      width: "48",
      height: "48",
      viewBox: "0 0 48 48",
      fill: "none",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ e("rect", { x: "8", y: "16", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ e("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ e("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
      ]
    }
  );
}
function Io({
  address: t,
  label: r = "Wallet Address",
  showCopy: s = !0,
  showExplorerLink: a = !0,
  allowReveal: n = !0,
  className: o = ""
}) {
  const l = Le(), [c, d] = N(!1), [u, p] = N(null), [f, h] = N(!1), w = Q(null), m = l?.config.solana?.network ?? "mainnet-beta", g = $(() => {
    const k = `https://explorer.solana.com/address/${t}`;
    return m === "mainnet-beta" ? k : `${k}?cluster=${encodeURIComponent(m)}`;
  }, [t, m]), y = n && t.length > 18, A = $(() => !y || f ? t : `${t.slice(0, 8)}...${t.slice(-8)}`, [t, y, f]), v = C(async () => {
    try {
      p(null), await navigator.clipboard.writeText(t), d(!0), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        d(!1), w.current = null;
      }, 2e3);
    } catch (k) {
      d(!1), p(k instanceof Error ? k.message : "Copy failed");
    }
  }, [t]);
  return I(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []), /* @__PURE__ */ i("div", { className: `cedros-wallet-address-row ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey-label", children: r }),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-actions", children: [
        y && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => h((k) => !k),
            "aria-label": f ? "Hide full wallet address" : "Show full wallet address",
            children: f ? /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ e(
                "path",
                {
                  d: "M3 3l18 18",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ e(
                "path",
                {
                  d: "M10.7 10.7a3 3 0 0 0 4.24 4.24",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ e(
                "path",
                {
                  d: "M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.55 1.23-1.32 2.33-2.27 3.25",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ e(
                "path",
                {
                  d: "M6.61 6.61C4.4 7.9 2.74 9.8 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.46",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            ] }) : /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ e(
                "path",
                {
                  d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ e(
                "path",
                {
                  d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            ] })
          }
        ),
        a && /* @__PURE__ */ e(
          "a",
          {
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            href: g,
            target: "_blank",
            rel: "noreferrer",
            children: "Explorer"
          }
        ),
        s && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-outline",
            onClick: v,
            "aria-label": "Copy wallet address",
            children: c ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("code", { className: "cedros-wallet-status-pubkey-value", title: t, children: A }),
    u && /* @__PURE__ */ e("p", { className: "cedros-input-hint", role: "status", children: u })
  ] });
}
function Fo({
  status: t,
  publicKey: r,
  onLock: s,
  onEnroll: a,
  onUnlock: n,
  onRecover: o,
  showActions: l = !0,
  compact: c = !1,
  className: d = ""
}) {
  const u = t !== void 0, p = tt(), f = u ? t : p.status, h = u ? r ?? null : p.solanaPubkey, w = u ? null : p.error, m = u ? () => {
  } : p.refresh, g = u ? () => {
  } : p.clearError, y = Oo(f, w);
  return c ? /* @__PURE__ */ i("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${d}`, children: [
    /* @__PURE__ */ e(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${y.color}`,
        title: y.label
      }
    ),
    /* @__PURE__ */ e("span", { className: "cedros-wallet-status-label", children: y.label }),
    h && /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey", title: h, children: Wo(h) })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-status ${d}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ e(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${y.color}`,
          children: /* @__PURE__ */ e(qo, { status: f })
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ e("h4", { className: "cedros-wallet-status-title", children: y.title }),
        /* @__PURE__ */ e("p", { className: "cedros-wallet-status-description", children: y.description })
      ] })
    ] }),
    h && /* @__PURE__ */ e("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ e(Io, { address: h }) }),
    w && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ e("p", { children: w }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: g,
          children: "Dismiss"
        }
      )
    ] }),
    l && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-actions", children: [
      f === "not_enrolled" && a && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: a,
          children: "Create Wallet"
        }
      ),
      f === "enrolled_locked" && n && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: n,
          children: "Unlock Wallet"
        }
      ),
      (f === "not_enrolled" || f === "error") && o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: o,
          children: "Recover Wallet"
        }
      ),
      f === "error" && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: m,
          children: "Retry"
        }
      )
    ] })
  ] });
}
function Oo(t, r) {
  switch (t) {
    case "loading":
      return {
        label: "Loading",
        title: "Checking Wallet",
        description: "Verifying wallet status...",
        color: "loading"
      };
    case "not_enrolled":
      return {
        label: "Not Set Up",
        title: "No Wallet",
        description: "Create a wallet to start using Solana.",
        color: "muted"
      };
    case "enrolled_locked":
      return {
        label: "Locked",
        title: "Wallet Locked",
        description: "Unlock your wallet to sign transactions.",
        color: "warning"
      };
    case "enrolled_unlocked":
    case "unlocked":
      return {
        label: "Ready",
        title: "Wallet Ready",
        description: "Your wallet is unlocked and ready to use.",
        color: "success"
      };
    case "error":
    default:
      return {
        label: "Error",
        title: "Wallet Error",
        description: r ?? "An error occurred with your wallet.",
        color: "error"
      };
  }
}
function Wo(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function qo({ status: t }) {
  switch (t) {
    case "loading":
      return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
        /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
        /* @__PURE__ */ e(
          "path",
          {
            d: "M12 3a9 9 0 0 1 9 9",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round"
          }
        )
      ] });
    case "not_enrolled":
      return /* @__PURE__ */ i(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ e("path", { d: "M8 12h8M12 8v8" })
          ]
        }
      );
    case "enrolled_locked":
      return /* @__PURE__ */ i(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ e("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
            /* @__PURE__ */ e("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
          ]
        }
      );
    case "enrolled_unlocked":
    case "unlocked":
      return /* @__PURE__ */ e(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: /* @__PURE__ */ e("path", { d: "M20 6L9 17l-5-5" })
        }
      );
    case "error":
      return /* @__PURE__ */ i(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ e("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
            /* @__PURE__ */ e("path", { d: "M12 9v4M12 17h.01" })
          ]
        }
      );
    default:
      return null;
  }
}
function ic({ className: t = "", showActions: r = !0 }) {
  const s = tt(), [a, n] = N("status"), o = $(() => {
    switch (a) {
      case "enroll":
        return { title: "Create Wallet", description: "Set up your embedded wallet." };
      case "unlock":
        return { title: "Unlock Wallet", description: "Unlock to sign transactions." };
      case "recover_intro":
      case "recover":
        return {
          title: "Recover Wallet",
          description: "Restore access using your recovery phrase."
        };
      case "status":
      default:
        return null;
    }
  }, [a]), l = C(() => n("status"), []), c = C(async () => {
    n("status"), await s.refresh();
  }, [s]), d = C(async () => {
    n("status"), await s.refresh();
  }, [s]), u = C(async () => {
    n("status"), await s.refresh();
  }, [s]);
  return /* @__PURE__ */ i("div", { className: `cedros-wallet-manager ${t}`, children: [
    a !== "status" && o && /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-header-text", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-wallet-manager-title", children: o.title }),
        /* @__PURE__ */ e("p", { className: "cedros-wallet-manager-subtitle", children: o.description })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-ghost",
          onClick: l,
          children: "Back"
        }
      )
    ] }),
    a === "status" && /* @__PURE__ */ e(
      Fo,
      {
        onEnroll: () => n("enroll"),
        onUnlock: () => n("unlock"),
        onRecover: () => n("recover_intro"),
        showActions: r
      }
    ),
    a === "enroll" && /* @__PURE__ */ e(
      bo,
      {
        onComplete: () => {
          c();
        },
        onCancel: l
      }
    ),
    a === "unlock" && /* @__PURE__ */ e(
      So,
      {
        onUnlock: () => {
          d();
        },
        onCancel: l
      }
    ),
    a === "recover_intro" && /* @__PURE__ */ e("div", { className: "cedros-wallet-manager-intro", children: /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-intro-card", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-wallet-manager-intro-title", children: "Before you start" }),
      /* @__PURE__ */ i("ul", { className: "cedros-wallet-manager-intro-list", children: [
        /* @__PURE__ */ e("li", { children: "You’ll need your 12-word recovery phrase." }),
        /* @__PURE__ */ e("li", { children: "You’ll set a new password or passkey for this wallet." }),
        /* @__PURE__ */ e("li", { children: "If you’re on a shared device, avoid copying the phrase into other apps." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-intro-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: () => n("recover"),
            children: "Start recovery"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: l,
            children: "Cancel"
          }
        )
      ] })
    ] }) }),
    a === "recover" && /* @__PURE__ */ e(
      Do,
      {
        onComplete: () => {
          u();
        },
        onCancel: l
      }
    )
  ] });
}
class _o {
  client;
  constructor(r, s, a, n) {
    this.client = new ie({ baseUrl: r, timeoutMs: s, retryAttempts: a, getAccessToken: n });
  }
  /**
   * Get all system settings grouped by category
   * Requires system admin privileges
   */
  async getSettings() {
    try {
      return await this.client.get("/admin/settings");
    } catch (r) {
      throw W(r, "Failed to fetch system settings");
    }
  }
  /**
   * Update one or more system settings
   * Requires system admin privileges
   */
  async updateSettings(r) {
    try {
      return await this.client.patch("/admin/settings", {
        settings: r
      });
    } catch (s) {
      throw W(s, "Failed to update system settings");
    }
  }
}
function jo() {
  const { config: t, authState: r, _internal: s } = se(), [a, n] = N({}), [o, l] = N(!1), [c, d] = N(!1), [u, p] = N(null), f = Q(0), h = $(
    () => new _o(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      s?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, s]
  ), w = Q(h);
  w.current = h;
  const m = C(async () => {
    if (r !== "authenticated") {
      n({});
      return;
    }
    l(!0), p(null);
    const A = ++f.current;
    try {
      const v = await w.current.getSettings();
      if (A !== f.current) return;
      n(v.settings);
    } catch (v) {
      if (A !== f.current) return;
      p(v instanceof Error ? v : new Error("Failed to fetch settings"));
    } finally {
      A === f.current && l(!1);
    }
  }, [r]), g = C(
    async (A) => {
      if (r !== "authenticated")
        throw new Error("Not authenticated");
      d(!0), p(null);
      try {
        await w.current.updateSettings(A), await m();
      } catch (v) {
        const k = v instanceof Error ? v : new Error("Failed to update settings");
        throw p(k), k;
      } finally {
        d(!1);
      }
    },
    [r, m]
  ), y = C(
    (A) => {
      for (const v of Object.values(a)) {
        const k = v.find((P) => P.key === A);
        if (k) return k.value;
      }
    },
    [a]
  );
  return {
    settings: a,
    isLoading: o,
    isUpdating: c,
    error: u,
    fetchSettings: m,
    updateSettings: g,
    getValue: y
  };
}
function $o(t) {
  const r = Math.floor(t / 86400), s = Math.floor(t % 86400 / 3600), a = Math.floor(t % 3600 / 60), n = t % 60;
  return { days: r, hours: s, minutes: a, seconds: n };
}
function zo(t) {
  const { days: r, hours: s, minutes: a } = $o(t), n = [];
  return r > 0 && n.push(`${r}d`), s > 0 && n.push(`${s}h`), a > 0 && n.push(`${a}m`), n.length === 0 && n.push(`${t}s`), n.join(" ");
}
const Vo = {
  // Privacy settings
  privacy_period_secs: {
    key: "privacy_period_secs",
    label: "Privacy Period",
    description: "How long deposits are held before withdrawal to provide timing privacy. Longer periods provide better privacy but delay user access to funds.",
    inputType: "duration",
    min: 0,
    presets: [
      { label: "Disabled", value: "0" },
      { label: "1 hour", value: "3600" },
      { label: "6 hours", value: "21600" },
      { label: "24 hours", value: "86400" },
      { label: "7 days", value: "604800" },
      { label: "14 days", value: "1209600" },
      { label: "30 days", value: "2592000" }
    ],
    warningThreshold: {
      below: 3600,
      message: "Very short privacy periods may not provide adequate timing protection."
    }
  },
  // Withdrawal worker settings
  withdrawal_poll_interval_secs: {
    key: "withdrawal_poll_interval_secs",
    label: "Worker Poll Interval",
    description: "How often the withdrawal worker checks for deposits ready to process. Lower values process faster but increase server load.",
    inputType: "duration",
    min: 60,
    presets: [
      { label: "1 minute", value: "60" },
      { label: "5 minutes", value: "300" },
      { label: "15 minutes", value: "900" },
      { label: "1 hour", value: "3600" },
      { label: "6 hours", value: "21600" }
    ],
    warningThreshold: {
      below: 60,
      message: "Polling more than once per minute may cause excessive load."
    }
  },
  withdrawal_batch_size: {
    key: "withdrawal_batch_size",
    label: "Batch Size",
    description: "Maximum number of withdrawals to process in a single batch. Higher values improve throughput but may cause timeouts.",
    inputType: "select",
    min: 1,
    max: 100,
    presets: [
      { label: "1 (Sequential)", value: "1" },
      { label: "5", value: "5" },
      { label: "10 (Recommended)", value: "10" },
      { label: "25", value: "25" },
      { label: "50", value: "50" },
      { label: "100 (Max)", value: "100" }
    ]
  },
  withdrawal_timeout_secs: {
    key: "withdrawal_timeout_secs",
    label: "Transaction Timeout",
    description: "How long to wait for a withdrawal transaction to confirm before considering it failed.",
    inputType: "duration",
    min: 30,
    presets: [
      { label: "30 seconds", value: "30" },
      { label: "1 minute", value: "60" },
      { label: "2 minutes", value: "120" },
      { label: "5 minutes", value: "300" }
    ],
    warningThreshold: {
      below: 30,
      message: "Very short timeouts may cause premature failure on slow networks."
    }
  },
  withdrawal_max_retries: {
    key: "withdrawal_max_retries",
    label: "Max Retries",
    description: "Number of times to retry a failed withdrawal before marking it as permanently failed.",
    inputType: "select",
    min: 0,
    max: 10,
    presets: [
      { label: "0 (No retries)", value: "0" },
      { label: "1", value: "1" },
      { label: "3 (Recommended)", value: "3" },
      { label: "5", value: "5" },
      { label: "10", value: "10" }
    ]
  },
  withdrawal_percentage: {
    key: "withdrawal_percentage",
    label: "Withdrawal Percentage",
    description: "Percentage of ready funds to withdraw each cycle. Lower values spread withdrawals over time for better privacy.",
    inputType: "percentage",
    min: 1,
    max: 100,
    step: 5,
    presets: [
      { label: "25%", value: "25" },
      { label: "50%", value: "50" },
      { label: "75%", value: "75" },
      { label: "100% (All at once)", value: "100" }
    ],
    warningThreshold: {
      above: 75,
      message: "High percentages may reduce timing privacy by processing most withdrawals together."
    }
  },
  partial_withdrawal_count: {
    key: "partial_withdrawal_count",
    label: "Partial Withdrawals",
    description: "Maximum partial withdrawals per batch. Partial withdrawals add noise to timing analysis. Set to 0 to disable.",
    inputType: "select",
    min: 0,
    presets: [
      { label: "Disabled", value: "0" },
      { label: "1", value: "1" },
      { label: "3", value: "3" },
      { label: "5", value: "5" },
      { label: "10", value: "10" }
    ]
  },
  partial_withdrawal_min_lamports: {
    key: "partial_withdrawal_min_lamports",
    label: "Min Balance for Partial",
    description: "Minimum account balance (in lamports) required before partial withdrawals are considered. 1 SOL = 1,000,000,000 lamports.",
    inputType: "select",
    min: 0,
    presets: [
      { label: "0.1 SOL", value: "100000000" },
      { label: "0.5 SOL", value: "500000000" },
      { label: "1 SOL", value: "1000000000" },
      { label: "5 SOL", value: "5000000000" },
      { label: "10 SOL", value: "10000000000" }
    ]
  },
  // Rate limit settings
  rate_limit_auth: {
    key: "rate_limit_auth",
    label: "Auth Request Limit",
    description: "Maximum authentication attempts (login, register, password reset) per IP per window. Protects against brute force attacks.",
    inputType: "select",
    min: 1,
    unit: "requests",
    presets: [
      { label: "5 (Strict)", value: "5" },
      { label: "10 (Recommended)", value: "10" },
      { label: "20", value: "20" },
      { label: "50 (Permissive)", value: "50" }
    ],
    warningThreshold: {
      above: 20,
      message: "High auth limits may allow brute force attempts."
    }
  },
  rate_limit_general: {
    key: "rate_limit_general",
    label: "General Request Limit",
    description: "Maximum general API requests per IP per window. Affects all non-auth endpoints.",
    inputType: "select",
    min: 1,
    unit: "requests",
    presets: [
      { label: "30", value: "30" },
      { label: "60 (Recommended)", value: "60" },
      { label: "120", value: "120" },
      { label: "300", value: "300" }
    ]
  },
  rate_limit_credit: {
    key: "rate_limit_credit",
    label: "Credit Request Limit",
    description: "Maximum credit/balance check requests per IP per window. Higher for apps that poll balance frequently.",
    inputType: "select",
    min: 1,
    unit: "requests",
    presets: [
      { label: "10", value: "10" },
      { label: "30 (Recommended)", value: "30" },
      { label: "60", value: "60" },
      { label: "120", value: "120" }
    ]
  },
  rate_limit_window: {
    key: "rate_limit_window",
    label: "Rate Limit Window",
    description: 'Time window for rate limiting. All limits above are "per window". Shorter windows are stricter.',
    inputType: "duration",
    min: 1,
    presets: [
      { label: "30 seconds", value: "30" },
      { label: "1 minute", value: "60" },
      { label: "5 minutes", value: "300" },
      { label: "15 minutes", value: "900" }
    ]
  },
  // Deposit settings
  deposit_quick_action_tokens: {
    key: "deposit_quick_action_tokens",
    label: "Quick Action Tokens",
    description: "Comma-separated token symbols shown as quick action buttons. First token is the default.",
    inputType: "tokenSymbolList"
  },
  deposit_custom_tokens: {
    key: "deposit_custom_tokens",
    label: "Custom Dropdown Tokens",
    description: 'Comma-separated token symbols shown in the "Custom" dropdown. Leave empty to show all.',
    inputType: "tokenSymbolList"
  },
  deposit_custom_tokens_json: {
    key: "deposit_custom_tokens_json",
    label: "Custom Token Definitions",
    description: "Add tokens beyond the built-in list. Define symbol, mint address, decimals, and logo URL.",
    inputType: "tokenList"
  }
}, Qo = {
  privacy: {
    label: "Privacy Settings",
    description: "Control the privacy period for deposits. Longer periods provide better timing privacy but delay fund availability.",
    icon: "🔒"
  },
  withdrawal: {
    label: "Withdrawal Worker",
    description: "Configure how the automated withdrawal processor handles pending withdrawals. These settings affect throughput and privacy.",
    icon: "⚙️"
  },
  rate_limit: {
    label: "Rate Limiting",
    description: "Protect the system from abuse by limiting request rates. Balance security with user experience.",
    icon: "🛡️"
  },
  deposit: {
    label: "Deposit Settings",
    description: "Configure token lists and deposit flow display options.",
    icon: "💳"
  }
};
function Ho({
  showDescriptions: t = !0,
  className: r = "",
  onSave: s
}) {
  const { settings: a, isLoading: n, isUpdating: o, error: l, fetchSettings: c, updateSettings: d } = jo(), [u, p] = N({}), [f, h] = N(null), [w, m] = N(!1);
  I(() => {
    c();
  }, [c]), I(() => {
    if (w) {
      const S = setTimeout(() => m(!1), 3e3);
      return () => clearTimeout(S);
    }
  }, [w]);
  const g = C((S, b) => {
    p((x) => ({ ...x, [S]: b })), h(null), m(!1);
  }, []), y = C(async () => {
    const S = Object.entries(u).map(([b, x]) => ({
      key: b,
      value: x
    }));
    if (S.length !== 0)
      try {
        await d(S), p({}), h(null), m(!0), s?.();
      } catch (b) {
        h(b instanceof Error ? b.message : "Failed to save settings");
      }
  }, [u, d, s]), A = C(() => {
    p({}), h(null), m(!1);
  }, []), v = Object.keys(u).length > 0, k = Object.keys(u).length;
  if (n && Object.keys(a).length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
      /* @__PURE__ */ e(ee, {}),
      /* @__PURE__ */ e("span", { children: "Loading settings..." })
    ] });
  if (l)
    return /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ e(ae, { error: l.message }) });
  const P = Object.keys(a).sort();
  return P.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-system-settings cedros-system-settings-empty ${r}`, children: /* @__PURE__ */ e("p", { children: "No system settings found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${r}`, children: [
    f && /* @__PURE__ */ e(ae, { error: f }),
    w && /* @__PURE__ */ e("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    P.map((S) => /* @__PURE__ */ e(
      Ko,
      {
        category: S,
        settings: a[S],
        edits: u,
        showDescription: t,
        onChange: g
      },
      S
    )),
    /* @__PURE__ */ i("div", { className: "cedros-system-settings-actions", children: [
      v && /* @__PURE__ */ i("span", { className: "cedros-settings-change-count", children: [
        k,
        " unsaved change",
        k !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: A,
          disabled: !v || o,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: y,
          disabled: !v || o,
          children: o ? /* @__PURE__ */ e(ee, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
function Ko({
  category: t,
  settings: r,
  edits: s,
  showDescription: a,
  onChange: n
}) {
  const o = Qo[t] || {
    label: t,
    description: "",
    icon: "⚙️"
  };
  return /* @__PURE__ */ i("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-settings-section-icon", children: o.icon }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("h3", { className: "cedros-settings-section-title", children: o.label }),
        a && o.description && /* @__PURE__ */ e("p", { className: "cedros-settings-section-description", children: o.description })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-settings-grid", children: r.map((l) => /* @__PURE__ */ e(
      Yo,
      {
        setting: l,
        editValue: s[l.key],
        onChange: n
      },
      l.key
    )) })
  ] });
}
function Yo({ setting: t, editValue: r, onChange: s }) {
  const a = Vo[t.key], n = r ?? t.value, o = r !== void 0 && r !== t.value, l = $(() => {
    if (!a?.warningThreshold) return null;
    const c = parseInt(n, 10);
    if (isNaN(c)) return null;
    const { above: d, below: u, message: p } = a.warningThreshold;
    return d !== void 0 && c > d || u !== void 0 && c < u ? p : null;
  }, [n, a?.warningThreshold]);
  return a ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-setting-row ${o ? "cedros-setting-row-changed" : ""} ${l ? "cedros-setting-row-warning" : ""}`,
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-setting-label", children: [
          /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: a.label }),
          /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: a.description })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-setting-control", children: [
          a.inputType === "duration" && /* @__PURE__ */ e(
            Go,
            {
              value: n,
              onChange: (c) => s(t.key, c),
              presets: a.presets,
              min: a.min
            }
          ),
          a.inputType === "percentage" && /* @__PURE__ */ e(
            Jo,
            {
              value: n,
              onChange: (c) => s(t.key, c),
              min: a.min ?? 1,
              max: a.max ?? 100,
              step: a.step ?? 5,
              presets: a.presets
            }
          ),
          a.inputType === "select" && /* @__PURE__ */ e(
            Xo,
            {
              value: n,
              onChange: (c) => s(t.key, c),
              presets: a.presets ?? [],
              unit: a.unit
            }
          ),
          a.inputType === "number" && /* @__PURE__ */ e(
            Zo,
            {
              value: n,
              onChange: (c) => s(t.key, c),
              min: a.min,
              max: a.max,
              unit: a.unit
            }
          ),
          a.inputType === "tokenList" && /* @__PURE__ */ e(ea, { value: n, onChange: (c) => s(t.key, c) }),
          a.inputType === "text" && /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              value: n,
              onChange: (c) => s(t.key, c.target.value),
              className: "cedros-setting-input",
              placeholder: a.label
            }
          ),
          a.inputType === "tokenSymbolList" && /* @__PURE__ */ e(
            ta,
            {
              value: n,
              onChange: (c) => s(t.key, c)
            }
          ),
          l && /* @__PURE__ */ e("div", { className: "cedros-setting-warning", children: l })
        ] })
      ]
    }
  ) : /* @__PURE__ */ i("div", { className: `cedros-setting-row ${o ? "cedros-setting-row-changed" : ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-setting-label", children: [
      /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: t.key }),
      t.description && /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: t.description })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-setting-input-wrapper", children: /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: n,
        onChange: (c) => s(t.key, c.target.value),
        className: "cedros-setting-input"
      }
    ) })
  ] });
}
function Go({ value: t, onChange: r, presets: s, min: a = 0 }) {
  const n = parseInt(t, 10) || 0, o = zo(n), l = C(
    (d) => {
      d.target.value && r(d.target.value);
    },
    [r]
  ), c = C(
    (d) => {
      const u = Math.max(a, parseInt(d.target.value, 10) || 0);
      r(String(u));
    },
    [r, a]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-duration-input", children: [
    s && s.length > 0 && /* @__PURE__ */ i(
      "select",
      {
        value: s.find((d) => d.value === t)?.value ?? "",
        onChange: l,
        className: "cedros-setting-select",
        children: [
          /* @__PURE__ */ e("option", { value: "", children: "Custom..." }),
          s.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
        ]
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-duration-custom", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "number",
          value: n,
          onChange: c,
          min: a,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: "seconds" }),
      /* @__PURE__ */ i("span", { className: "cedros-duration-display", children: [
        "= ",
        o
      ] })
    ] })
  ] });
}
function Jo({ value: t, onChange: r, min: s, max: a, step: n, presets: o }) {
  const l = parseInt(t, 10) || s, c = C(
    (u) => {
      r(u.target.value);
    },
    [r]
  ), d = C(
    (u) => {
      r(u);
    },
    [r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-percentage-input", children: [
    /* @__PURE__ */ i("div", { className: "cedros-percentage-slider-row", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "range",
          value: l,
          onChange: c,
          min: s,
          max: a,
          step: n,
          className: "cedros-percentage-slider"
        }
      ),
      /* @__PURE__ */ i("span", { className: "cedros-percentage-value", children: [
        l,
        "%"
      ] })
    ] }),
    o && o.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-preset-buttons", children: o.map((u) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-preset-button ${u.value === t ? "cedros-preset-button-active" : ""}`,
        onClick: () => d(u.value),
        children: u.label
      },
      u.value
    )) })
  ] });
}
function Xo({ value: t, onChange: r, presets: s, unit: a }) {
  const n = !s.some((c) => c.value === t), o = C(
    (c) => {
      c.target.value !== "__custom__" && r(c.target.value);
    },
    [r]
  ), l = C(
    (c) => {
      r(c.target.value);
    },
    [r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-select-input", children: [
    /* @__PURE__ */ i(
      "select",
      {
        value: n ? "__custom__" : t,
        onChange: o,
        className: "cedros-setting-select",
        children: [
          s.map((c) => /* @__PURE__ */ e("option", { value: c.value, children: c.label }, c.value)),
          /* @__PURE__ */ e("option", { value: "__custom__", children: "Custom..." })
        ]
      }
    ),
    n && /* @__PURE__ */ i("div", { className: "cedros-select-custom", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "number",
          value: t,
          onChange: l,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      a && /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: a })
    ] })
  ] });
}
function Zo({ value: t, onChange: r, min: s, max: a, unit: n }) {
  const o = C(
    (l) => {
      r(l.target.value);
    },
    [r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-number-input", children: [
    /* @__PURE__ */ e(
      "input",
      {
        type: "number",
        value: t,
        onChange: o,
        min: s,
        max: a,
        className: "cedros-setting-input"
      }
    ),
    n && /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: n })
  ] });
}
const hs = [
  "SOL",
  "USDC",
  "USDT",
  "EURC",
  "USD1",
  "PYUSD",
  "USDH",
  "CASH",
  "BONK",
  "ORE"
];
function ea({ value: t, onChange: r }) {
  const s = $(() => {
    try {
      return JSON.parse(t || "[]");
    } catch {
      return [];
    }
  }, [t]), a = C(
    (c) => {
      r(JSON.stringify(c));
    },
    [r]
  ), n = C(() => {
    a([...s, { symbol: "", mint: "", decimals: 6 }]);
  }, [s, a]), o = C(
    (c, d, u) => {
      const p = [...s];
      p[c] = { ...p[c], [d]: u }, a(p);
    },
    [s, a]
  ), l = C(
    (c) => {
      a(s.filter((d, u) => u !== c));
    },
    [s, a]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-token-list-input", children: [
    /* @__PURE__ */ i("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ e("span", { className: "cedros-token-presets-label", children: "Built-in tokens:" }),
      /* @__PURE__ */ e("div", { className: "cedros-token-presets-list", children: hs.map((c) => /* @__PURE__ */ e("span", { className: "cedros-token-preset-chip", children: c }, c)) })
    ] }),
    s.length === 0 && /* @__PURE__ */ e("p", { className: "cedros-token-list-empty", children: "No custom tokens added. Use the built-in tokens above or add your own." }),
    s.map((c, d) => /* @__PURE__ */ i("div", { className: "cedros-token-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-token-row-fields", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Symbol",
            value: c.symbol,
            onChange: (u) => o(d, "symbol", u.target.value.toUpperCase()),
            className: "cedros-setting-input cedros-token-input-symbol",
            maxLength: 10
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Mint address",
            value: c.mint,
            onChange: (u) => o(d, "mint", u.target.value),
            className: "cedros-setting-input cedros-token-input-mint"
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            placeholder: "Decimals",
            value: c.decimals,
            onChange: (u) => o(d, "decimals", parseInt(u.target.value, 10) || 0),
            className: "cedros-setting-input cedros-token-input-decimals",
            min: 0,
            max: 18
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Logo URL (optional)",
            value: c.logoUrl || "",
            onChange: (u) => o(d, "logoUrl", u.target.value || void 0),
            className: "cedros-setting-input cedros-token-input-logo"
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-token-remove-btn",
          onClick: () => l(d),
          title: "Remove token",
          children: "×"
        }
      )
    ] }, d)),
    /* @__PURE__ */ e("button", { type: "button", className: "cedros-token-add-btn", onClick: n, children: "+ Add Token" })
  ] });
}
function ta({ value: t, onChange: r }) {
  const s = $(() => t.split(",").map((o) => o.trim()).filter(Boolean), [t]), a = C(
    (o) => {
      if (!o || s.includes(o)) return;
      const l = [...s, o].join(", ");
      r(l);
    },
    [s, r]
  ), n = C(
    (o) => {
      const l = s.filter((c) => c !== o).join(", ");
      r(l);
    },
    [s, r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-token-symbol-list-input", children: [
    /* @__PURE__ */ i("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ e("span", { className: "cedros-token-presets-label", children: "Click to add:" }),
      /* @__PURE__ */ e("div", { className: "cedros-token-presets-list", children: hs.map((o) => {
        const l = s.includes(o);
        return /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: `cedros-token-preset-chip ${l ? "cedros-token-preset-chip-selected" : ""}`,
            onClick: () => l ? n(o) : a(o),
            title: l ? `Remove ${o}` : `Add ${o}`,
            children: [
              o,
              l && /* @__PURE__ */ e("span", { className: "cedros-token-chip-check", children: "✓" })
            ]
          },
          o
        );
      }) })
    ] }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: t,
        onChange: (o) => r(o.target.value),
        className: "cedros-setting-input",
        placeholder: "USDC, SOL, BONK..."
      }
    )
  ] });
}
class ms {
  client;
  constructor(r, s, a, n) {
    this.client = new ie({ baseUrl: r, timeoutMs: s, retryAttempts: a, getAccessToken: n });
  }
  /**
   * List all organizations the current user belongs to
   */
  async listOrgs() {
    try {
      return (await this.client.get("/orgs")).orgs.map((s) => ({
        ...s,
        membership: {
          orgId: s.id,
          role: s.role
        }
      }));
    } catch (r) {
      throw W(r, "Failed to list organizations");
    }
  }
  /**
   * Get a single organization by ID
   */
  async getOrg(r) {
    try {
      return await this.client.get(`/orgs/${r}`);
    } catch (s) {
      throw W(s, "Failed to get organization");
    }
  }
  /**
   * Create a new organization
   */
  async createOrg(r) {
    try {
      return await this.client.post("/orgs", r);
    } catch (s) {
      throw W(s, "Failed to create organization");
    }
  }
  /**
   * Update an organization
   */
  async updateOrg(r, s) {
    try {
      return await this.client.patch(`/orgs/${r}`, s);
    } catch (a) {
      throw W(a, "Failed to update organization");
    }
  }
  /**
   * Delete an organization
   */
  async deleteOrg(r) {
    try {
      await this.client.delete(`/orgs/${r}`);
    } catch (s) {
      throw W(s, "Failed to delete organization");
    }
  }
  /**
   * Check authorization for an action
   */
  async authorize(r) {
    try {
      return await this.client.post("/authorize", r);
    } catch (s) {
      throw W(s, "Failed to check authorization");
    }
  }
  /**
   * Get current user's permissions in an organization
   */
  async getPermissions(r) {
    try {
      return await this.client.post("/permissions", { orgId: r });
    } catch (s) {
      throw W(s, "Failed to get permissions");
    }
  }
}
const ct = "cedros_active_org";
function ra(t) {
  try {
    return localStorage.getItem(t);
  } catch {
    return null;
  }
}
function rr(t, r) {
  try {
    localStorage.setItem(t, r);
  } catch {
  }
}
function sa() {
  const { config: t, user: r, authState: s, _internal: a } = se(), n = typeof window < "u" && !!window.localStorage, [o, l] = N([]), [c, d] = N(null), [u, p] = N([]), [f, h] = N(null), [w, m] = N(!1), [g, y] = N(null), A = $(
    () => new ms(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      a?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, a]
  ), v = Q(A);
  I(() => {
    v.current = A;
  }, [A]);
  const k = C(async (D) => {
    try {
      const L = await v.current.getPermissions(D);
      p(L.permissions), h(L.role);
    } catch {
      p([]), h(null);
    }
  }, []), P = C(async () => {
    if (s !== "authenticated" || !r) {
      l([]), d(null), p([]), h(null);
      return;
    }
    m(!0), y(null);
    try {
      const D = await v.current.listOrgs();
      l(D);
      const L = n ? ra(ct) : null;
      let T = D.find((R) => R.id === L);
      !T && D.length > 0 && (T = D.find((R) => R.isPersonal) || D[0]), T ? (d(T), n && rr(ct, T.id), await k(T.id)) : (d(null), p([]), h(null));
    } catch (D) {
      y(D);
    } finally {
      m(!1);
    }
  }, [s, r, k, n]), S = C(
    async (D) => {
      const L = o.find((T) => T.id === D);
      if (!L) {
        y({ code: "UNKNOWN_ERROR", message: "Organization not found" });
        return;
      }
      d(L), n && rr(ct, D), await k(D);
    },
    [o, k, n]
  ), b = C(
    async (D) => {
      m(!0), y(null);
      try {
        const L = await v.current.createOrg(D);
        return await P(), L;
      } catch (L) {
        throw y(L), L;
      } finally {
        m(!1);
      }
    },
    [P]
  ), x = C(
    async (D, L) => {
      m(!0), y(null);
      try {
        const T = await v.current.updateOrg(D, L);
        return await P(), T;
      } catch (T) {
        throw y(T), T;
      } finally {
        m(!1);
      }
    },
    [P]
  ), M = C(
    async (D) => {
      m(!0), y(null);
      try {
        await v.current.deleteOrg(D), await P();
      } catch (L) {
        throw y(L), L;
      } finally {
        m(!1);
      }
    },
    [P]
  ), E = C(
    (D) => u.includes(D),
    [u]
  );
  return {
    orgs: o,
    activeOrg: c,
    permissions: u,
    role: f,
    isLoading: w,
    error: g,
    fetchOrgs: P,
    switchOrg: S,
    createOrg: b,
    updateOrg: x,
    deleteOrg: M,
    hasPermission: E
  };
}
class na {
  client;
  constructor(r, s, a, n) {
    this.client = new ie({ baseUrl: r, timeoutMs: s, retryAttempts: a, getAccessToken: n });
  }
  /**
   * List all members of an organization
   */
  async listMembers(r, s = 50, a = 0) {
    try {
      const n = await this.client.get(
        `/orgs/${r}/members?limit=${s}&offset=${a}`
      );
      return {
        members: n.members.map((o) => ({
          id: o.id,
          userId: o.userId,
          orgId: r,
          role: o.role,
          joinedAt: o.joinedAt,
          user: {
            id: o.userId,
            email: o.email,
            name: o.name
          }
        })),
        total: n.total
      };
    } catch (n) {
      throw W(n, "Failed to list members");
    }
  }
  /**
   * Update a member's role
   */
  async updateMemberRole(r, s, a) {
    try {
      return await this.client.patch(`/orgs/${r}/members/${s}`, a);
    } catch (n) {
      throw W(n, "Failed to update member role");
    }
  }
  /**
   * Remove a member from the organization
   */
  async removeMember(r, s) {
    try {
      await this.client.delete(`/orgs/${r}/members/${s}`);
    } catch (a) {
      throw W(a, "Failed to remove member");
    }
  }
}
function oa(t) {
  const { config: r, authState: s, _internal: a } = se(), [n, o] = N([]), [l, c] = N(0), [d, u] = N(!1), [p, f] = N(null), h = Q(void 0), w = Q(0), m = $(
    () => new na(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      a?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, a]
  ), g = Q(m);
  g.current = m;
  const y = C(
    async (k) => {
      if (!t || s !== "authenticated") {
        o([]), c(0);
        return;
      }
      u(!0), f(null);
      const P = ++w.current;
      try {
        const { limit: S = 50, offset: b = 0 } = k ?? {}, x = await g.current.listMembers(t, S, b);
        if (P !== w.current) return;
        o(x.members), c(x.total);
      } catch (S) {
        if (P !== w.current) return;
        f(S);
      } finally {
        P === w.current && u(!1);
      }
    },
    [t, s]
  );
  I(() => {
    if (s !== "authenticated") {
      h.current = void 0;
      return;
    }
    t !== h.current && (h.current = t, y());
  }, [t, s, y]);
  const A = C(
    async (k, P) => {
      if (!t)
        throw new Error("No organization selected");
      u(!0), f(null);
      try {
        await g.current.updateMemberRole(t, k, { role: P }), await y();
      } catch (S) {
        throw f(S), S;
      } finally {
        u(!1);
      }
    },
    [t, y]
  ), v = C(
    async (k) => {
      if (!t)
        throw new Error("No organization selected");
      u(!0), f(null);
      try {
        await g.current.removeMember(t, k), await y();
      } catch (P) {
        throw f(P), P;
      } finally {
        u(!1);
      }
    },
    [t, y]
  );
  return {
    members: n,
    total: l,
    isLoading: d,
    error: p,
    fetchMembers: y,
    updateMemberRole: A,
    removeMember: v
  };
}
class aa {
  client;
  constructor(r, s, a, n) {
    this.client = new ie({ baseUrl: r, timeoutMs: s, retryAttempts: a, getAccessToken: n });
  }
  /**
   * List all pending invites for an organization
   */
  async listInvites(r, s = 50, a = 0) {
    try {
      const n = await this.client.get(
        `/orgs/${r}/invites?limit=${s}&offset=${a}`
      );
      return {
        invites: n.invites.map((o) => ({
          id: o.id,
          orgId: o.orgId,
          email: o.email,
          role: o.role,
          invitedBy: o.invitedBy,
          createdAt: o.createdAt,
          expiresAt: o.expiresAt
        })),
        total: n.total
      };
    } catch (n) {
      throw W(n, "Failed to list invites");
    }
  }
  /**
   * Create a new invite
   */
  async createInvite(r, s) {
    try {
      return await this.client.post(`/orgs/${r}/invites`, s);
    } catch (a) {
      throw W(a, "Failed to create invite");
    }
  }
  /**
   * Cancel a pending invite
   */
  async cancelInvite(r, s) {
    try {
      await this.client.delete(`/orgs/${r}/invites/${s}`);
    } catch (a) {
      throw W(a, "Failed to cancel invite");
    }
  }
  /**
   * Resend an invite email
   */
  async resendInvite(r, s) {
    try {
      await this.client.post(`/orgs/${r}/invites/${s}/resend`, {});
    } catch (a) {
      throw W(a, "Failed to resend invite");
    }
  }
  /**
   * Accept an invite (public endpoint)
   */
  async acceptInvite(r) {
    try {
      return await this.client.post("/invites/accept", r);
    } catch (s) {
      throw W(s, "Failed to accept invite");
    }
  }
}
function ia(t) {
  const { config: r, authState: s, _internal: a } = se(), [n, o] = N([]), [l, c] = N(0), [d, u] = N(!1), [p, f] = N(null), h = Q(void 0), w = Q(0), m = $(
    () => new aa(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      a?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, a]
  ), g = Q(m);
  g.current = m;
  const y = C(
    async (S) => {
      if (!t || s !== "authenticated") {
        o([]), c(0);
        return;
      }
      u(!0), f(null);
      const b = ++w.current;
      try {
        const { limit: x = 50, offset: M = 0 } = S ?? {}, E = await g.current.listInvites(t, x, M);
        if (b !== w.current) return;
        o(E.invites), c(E.total);
      } catch (x) {
        if (b !== w.current) return;
        f(x);
      } finally {
        b === w.current && u(!1);
      }
    },
    [t, s]
  );
  I(() => {
    if (s !== "authenticated") {
      h.current = void 0;
      return;
    }
    t !== h.current && (h.current = t, y());
  }, [t, s, y]);
  const A = C(
    async (S, b = "member") => {
      if (!t)
        throw new Error("No organization selected");
      u(!0), f(null);
      try {
        await g.current.createInvite(t, { email: S, role: b }), await y();
      } catch (x) {
        throw f(x), x;
      } finally {
        u(!1);
      }
    },
    [t, y]
  ), v = C(
    async (S) => {
      if (!t)
        throw new Error("No organization selected");
      u(!0), f(null);
      try {
        await g.current.cancelInvite(t, S), await y();
      } catch (b) {
        throw f(b), b;
      } finally {
        u(!1);
      }
    },
    [t, y]
  ), k = C(
    async (S) => {
      if (!t)
        throw new Error("No organization selected");
      u(!0), f(null);
      try {
        await g.current.resendInvite(t, S);
      } catch (b) {
        throw f(b), b;
      } finally {
        u(!1);
      }
    },
    [t]
  ), P = C(async (S) => {
    u(!0), f(null);
    try {
      return await g.current.acceptInvite({ token: S });
    } catch (b) {
      throw f(b), b;
    } finally {
      u(!1);
    }
  }, []);
  return {
    invites: n,
    total: l,
    isLoading: d,
    error: p,
    fetchInvites: y,
    createInvite: A,
    cancelInvite: v,
    resendInvite: k,
    acceptInvite: P
  };
}
function jt() {
  const t = Le(), [r, s] = N(!1), [a, n] = N(null), o = $(() => t ? new ie({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = C(() => {
    n(null);
  }, []), c = C(async () => {
    if (!o)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await o.get("/credits/balance/sol");
    } catch (p) {
      const f = W(p, "Failed to fetch credit balance");
      throw n(f.message), f;
    } finally {
      s(!1);
    }
  }, [o]), d = C(async () => {
    if (!o)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return (await o.get("/credits/balance")).balances;
    } catch (p) {
      const f = W(p, "Failed to fetch credit balances");
      throw n(f.message), f;
    } finally {
      s(!1);
    }
  }, [o]), u = C(
    async (p) => {
      if (!o)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const f = new URLSearchParams();
        p?.currency && f.set("currency", p.currency), p?.limit && f.set("limit", p.limit.toString()), p?.offset && f.set("offset", p.offset.toString());
        const h = f.toString(), w = h ? `/credits/history?${h}` : "/credits/history";
        return await o.get(w);
      } catch (f) {
        const h = W(f, "Failed to fetch transaction history");
        throw n(h.message), h;
      } finally {
        s(!1);
      }
    },
    [o]
  );
  return {
    getBalance: c,
    getAllBalances: d,
    getHistory: u,
    isLoading: r,
    error: a,
    clearError: l
  };
}
function De() {
  const t = Le(), [r, s] = N(!1), [a, n] = N(null), o = $(() => t ? new ie({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = C(() => {
    n(null);
  }, []), c = C(
    async (g) => {
      if (!o)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const y = new URLSearchParams();
        g?.status && y.set("status", g.status), g?.limit !== void 0 && y.set("limit", String(g.limit)), g?.offset !== void 0 && y.set("offset", String(g.offset));
        const A = y.toString(), v = A ? `/admin/deposits?${A}` : "/admin/deposits";
        return await o.get(v);
      } catch (y) {
        const A = W(y, "Failed to list deposits");
        throw n(A.message), A;
      } finally {
        s(!1);
      }
    },
    [o]
  ), d = C(async () => {
    if (!o)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await o.get("/admin/deposits/stats");
    } catch (g) {
      const y = W(g, "Failed to get deposit stats");
      throw n(y.message), y;
    } finally {
      s(!1);
    }
  }, [o]), u = C(
    async (g) => {
      if (!o)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const y = new URLSearchParams();
        g?.limit !== void 0 && y.set("limit", String(g.limit)), g?.offset !== void 0 && y.set("offset", String(g.offset));
        const A = y.toString(), v = A ? `/admin/deposits/in-privacy-period?${A}` : "/admin/deposits/in-privacy-period";
        return await o.get(v);
      } catch (y) {
        const A = W(y, "Failed to list deposits in privacy period");
        throw n(A.message), A;
      } finally {
        s(!1);
      }
    },
    [o]
  ), p = C(
    async (g) => {
      if (!o)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const y = new URLSearchParams();
        g?.limit !== void 0 && y.set("limit", String(g.limit)), g?.offset !== void 0 && y.set("offset", String(g.offset));
        const A = y.toString(), v = A ? `/admin/withdrawals/pending?${A}` : "/admin/withdrawals/pending";
        return await o.get(v);
      } catch (y) {
        const A = W(y, "Failed to list pending withdrawals");
        throw n(A.message), A;
      } finally {
        s(!1);
      }
    },
    [o]
  ), f = C(
    async (g, y) => {
      if (!o)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await o.post(
          `/admin/withdrawals/${g}/process`,
          y ?? {}
        );
      } catch (A) {
        const v = W(A, "Failed to process withdrawal");
        throw n(v.message), v;
      } finally {
        s(!1);
      }
    },
    [o]
  ), h = C(async () => {
    if (!o)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await o.post(
        "/admin/withdrawals/process-all",
        {}
      );
    } catch (g) {
      const y = W(g, "Failed to process withdrawals");
      throw n(y.message), y;
    } finally {
      s(!1);
    }
  }, [o]), w = C(async () => {
    if (!o)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await o.get("/admin/privacy/status");
    } catch (g) {
      const y = W(g, "Failed to get privacy status");
      throw n(y.message), y;
    } finally {
      s(!1);
    }
  }, [o]), m = C(async () => {
    if (!o)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await o.get("/admin/credits/stats");
    } catch (g) {
      const y = W(g, "Failed to get credit stats");
      throw n(y.message), y;
    } finally {
      s(!1);
    }
  }, [o]);
  return {
    listDeposits: c,
    getStats: d,
    listInPrivacyPeriod: u,
    listPendingWithdrawals: p,
    processWithdrawal: f,
    processAllWithdrawals: h,
    getPrivacyStatus: w,
    getCreditStats: m,
    isLoading: r,
    error: a,
    clearError: l
  };
}
function ps({
  refreshInterval: t = 0,
  className: r = "",
  onLoad: s
}) {
  const { getStats: a, isLoading: n, error: o, clearError: l } = De(), [c, d] = N(null), [u, p] = N(null), f = C(async () => {
    try {
      const h = await a();
      d(h), s?.(h), p(null);
    } catch (h) {
      p(h instanceof Error ? h.message : "Failed to load stats");
    }
  }, [a, s]);
  return I(() => {
    f();
  }, [f]), I(() => {
    if (t <= 0) return;
    const h = setInterval(f, t);
    return () => clearInterval(h);
  }, [t, f]), u || o ? /* @__PURE__ */ i("div", { className: `cedros-admin-stats cedros-admin-stats-error ${r}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: u || o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          l(), p(null), f();
        },
        children: "Retry"
      }
    )
  ] }) : n && !c ? /* @__PURE__ */ i("div", { className: `cedros-admin-stats cedros-admin-stats-loading ${r}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading statistics..." })
  ] }) : c ? /* @__PURE__ */ i("div", { className: `cedros-admin-stats ${r}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-stats-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-stats-title", children: "Deposit Statistics" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
          onClick: f,
          disabled: n,
          title: "Refresh stats",
          "aria-label": "Refresh stats",
          children: n ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-stats-grid", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Deposits" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.totalDeposits }),
        /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
          c.totalDepositedSol.toFixed(4),
          " SOL"
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card cedros-admin-stat-pending", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Pending Withdrawal" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.pendingWithdrawalCount }),
        /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
          c.pendingWithdrawalSol.toFixed(4),
          " SOL"
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card cedros-admin-stat-success", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Withdrawn" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.totalWithdrawnCount }),
        /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
          c.totalWithdrawnSol.toFixed(4),
          " SOL"
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card cedros-admin-stat-error", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Failed" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.failedCount })
      ] })
    ] }),
    (c.readyForWithdrawalCount !== void 0 || c.inPrivacyPeriodCount !== void 0) && /* @__PURE__ */ i("div", { className: "cedros-admin-stats-section", children: [
      /* @__PURE__ */ e("h5", { className: "cedros-admin-stats-section-title", children: "Withdrawal Status" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stats-grid", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card cedros-admin-stat-ready", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Ready Now" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.readyForWithdrawalCount ?? 0 }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
            (c.readyForWithdrawalSol ?? 0).toFixed(4),
            " SOL"
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card cedros-admin-stat-waiting", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "In Privacy Period" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.inPrivacyPeriodCount ?? 0 }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
            (c.inPrivacyPeriodSol ?? 0).toFixed(4),
            " SOL"
          ] })
        ] })
      ] })
    ] }),
    (c.usdcDepositCount !== void 0 || c.usdtDepositCount !== void 0) && /* @__PURE__ */ i("div", { className: "cedros-admin-stats-section", children: [
      /* @__PURE__ */ e("h5", { className: "cedros-admin-stats-section-title", children: "Input Tokens" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stats-grid", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "USDC Deposits" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.usdcDepositCount ?? 0 }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
            "$",
            (c.totalUsdcDisplay ?? 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "USDT Deposits" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.usdtDepositCount ?? 0 }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
            "$",
            (c.totalUsdtDisplay ?? 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Native SOL" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: c.nativeSolDepositCount ?? 0 }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-stat-sub", children: [
            (c.totalNativeSolDisplay ?? 0).toFixed(4),
            " SOL"
          ] })
        ] })
      ] })
    ] })
  ] }) : null;
}
function ca(t) {
  return {
    pending: "Pending",
    detected: "Detected",
    processing: "Processing",
    completed: "Completed",
    withdrawn: "Withdrawn",
    partially_withdrawn: "Partially Withdrawn",
    expired: "Expired",
    failed: "Failed"
  }[t] || t;
}
function la(t) {
  return t === "completed" || t === "withdrawn" || t === "partially_withdrawn" ? "cedros-admin-deposit-success" : t === "failed" || t === "expired" ? "cedros-admin-deposit-error" : t === "processing" || t === "detected" ? "cedros-admin-deposit-processing" : "cedros-admin-deposit-pending";
}
function da(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function ua(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function sr(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function ha({
  statusFilter: t,
  pageSize: r = 20,
  refreshInterval: s = 0,
  className: a = "",
  onLoad: n,
  onDepositClick: o
}) {
  const { listDeposits: l, isLoading: c, error: d, clearError: u } = De(), [p, f] = N([]), [h, w] = N(0), [m, g] = N(0), [y, A] = N(null), v = C(async () => {
    try {
      const b = await l({ status: t, limit: r, offset: m });
      f(b.deposits), w(b.total), n?.(b), A(null);
    } catch (b) {
      A(b instanceof Error ? b.message : "Failed to load deposits");
    }
  }, [t, r, m, l, n]);
  I(() => {
    g(0);
  }, [t, r]), I(() => {
    v();
  }, [v]), I(() => {
    if (s <= 0) return;
    const b = setInterval(v, s);
    return () => clearInterval(b);
  }, [s, v]);
  const k = Math.ceil(h / r), P = Math.floor(m / r) + 1, S = (b) => {
    const x = (b - 1) * r;
    g(Math.max(0, Math.min(x, Math.max(0, h - 1))));
  };
  return y || d ? /* @__PURE__ */ i("div", { className: `cedros-admin-deposit-list cedros-admin-deposit-list-error ${a}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: y || d }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          u(), A(null), v();
        },
        children: "Retry"
      }
    )
  ] }) : c && p.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-admin-deposit-list cedros-admin-deposit-list-loading ${a}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-admin-deposit-list ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-deposit-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-deposit-list-title", children: "All Deposits" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
          onClick: v,
          disabled: c,
          title: "Refresh deposits",
          "aria-label": "Refresh deposits",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    p.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No deposits found." }) }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-deposit-table", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-deposit-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: "User" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: "Amount" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: "Status" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: "Created" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: "Tx" })
        ] }),
        p.map((b) => /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-admin-deposit-row ${la(b.status)}`,
            onClick: () => o?.(b),
            onKeyDown: (x) => {
              (x.key === "Enter" || x.key === " ") && (x.preventDefault(), o?.(b));
            },
            role: o ? "button" : void 0,
            tabIndex: o ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", title: b.userId, children: sr(b.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", children: da(b.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", children: /* @__PURE__ */ e("span", { className: "cedros-admin-status-badge", children: ca(b.status) }) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", children: ua(b.createdAt) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", title: b.txSignature || void 0, children: b.txSignature ? sr(b.txSignature) : "—" })
            ]
          },
          b.id
        ))
      ] }),
      k > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => S(P - 1),
            disabled: P <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          P,
          " of ",
          k,
          " (",
          h,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => S(P + 1),
            disabled: P >= k,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function nr(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function or(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ar(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function ma(t) {
  const r = new Date(t), a = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), n = Math.floor(a / 6e4), o = Math.floor(n / 60), l = Math.floor(o / 24);
  return l > 0 ? `${l}d ago` : o > 0 ? `${o}h ago` : n > 0 ? `${n}m ago` : "just now";
}
function ir(t) {
  return t ? new Date(t) > /* @__PURE__ */ new Date() : !0;
}
function pa({
  pageSize: t = 20,
  refreshInterval: r = 0,
  className: s = "",
  onLoad: a,
  onItemClick: n,
  onWithdrawalProcessed: o,
  onAllProcessed: l
}) {
  const {
    listPendingWithdrawals: c,
    processWithdrawal: d,
    processAllWithdrawals: u,
    isLoading: p,
    error: f,
    clearError: h
  } = De(), [w, m] = N([]), [g, y] = N(0), [A, v] = N(0), [k, P] = N(null), [S, b] = N(null), [x, M] = N(!1), [E, D] = N(null), [L, T] = N(null), R = C(async () => {
    try {
      const B = await c({ limit: t, offset: A });
      m(B.deposits), y(B.total), a?.(B), P(null);
    } catch (B) {
      P(B instanceof Error ? B.message : "Failed to load pending withdrawals");
    }
  }, [t, A, c, a]);
  I(() => {
    v(0);
  }, [t]), I(() => {
    R();
  }, [R]), I(() => {
    if (r <= 0) return;
    const B = setInterval(R, r);
    return () => clearInterval(B);
  }, [r, R]), I(() => {
    if (!E) return;
    const B = setTimeout(() => D(null), 5e3);
    return () => clearTimeout(B);
  }, [E]);
  const F = Math.ceil(g / t), _ = Math.floor(A / t) + 1, U = (B) => {
    const q = (B - 1) * t;
    v(Math.max(0, Math.min(q, Math.max(0, g - 1))));
  }, J = async (B, q = !1) => {
    if (!q && ir(B.withdrawalAvailableAt)) {
      T(B);
      return;
    }
    b(B.id), D(null);
    try {
      const O = await d(B.id, { force: q });
      O.success ? (D({
        type: "success",
        message: `Withdrawal processed: ${O.txSignature?.slice(0, 12)}...`
      }), o?.(O), await R()) : D({
        type: "error",
        message: O.error || "Failed to process withdrawal"
      });
    } catch (O) {
      D({
        type: "error",
        message: O instanceof Error ? O.message : "Failed to process withdrawal"
      });
    } finally {
      b(null), T(null);
    }
  }, K = async () => {
    if (w.length !== 0) {
      M(!0), D(null);
      try {
        const B = await u();
        B.totalSucceeded > 0 ? D({
          type: "success",
          message: `Processed ${B.totalSucceeded}/${B.totalProcessed} withdrawals`
        }) : B.totalFailed > 0 && D({
          type: "error",
          message: `Failed to process ${B.totalFailed} withdrawals`
        }), l?.(B), await R();
      } catch (B) {
        D({
          type: "error",
          message: B instanceof Error ? B.message : "Failed to process withdrawals"
        });
      } finally {
        M(!1);
      }
    }
  };
  return k || f ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-error ${s}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: k || f }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              h(), P(null), R();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : p && w.length === 0 && !S && !x ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-loading ${s}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal queue..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { className: `cedros-admin-withdrawal-queue ${s}`, children: [
    L && /* @__PURE__ */ e(
      "div",
      {
        className: "cedros-admin-modal-overlay",
        onClick: () => T(null),
        onKeyDown: (B) => B.key === "Escape" && T(null),
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "early-withdrawal-title",
        children: /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-admin-modal cedros-admin-modal-warning",
            onClick: (B) => B.stopPropagation(),
            onKeyDown: () => {
            },
            role: "document",
            children: [
              /* @__PURE__ */ e("h3", { id: "early-withdrawal-title", className: "cedros-admin-modal-title", children: "Early Withdrawal Warning" }),
              /* @__PURE__ */ i("div", { className: "cedros-admin-modal-content", children: [
                /* @__PURE__ */ e("p", { className: "cedros-admin-modal-warning-text", children: /* @__PURE__ */ e("strong", { children: "This deposit is still within its privacy period." }) }),
                /* @__PURE__ */ e("p", { children: "Processing this withdrawal early may compromise user privacy. The privacy period exists to provide plausible deniability for deposits." }),
                /* @__PURE__ */ i("p", { className: "cedros-admin-modal-details", children: [
                  "User: ",
                  ar(L.userId),
                  /* @__PURE__ */ e("br", {}),
                  "Amount: ",
                  nr(L.amountLamports),
                  /* @__PURE__ */ e("br", {}),
                  "Available at:",
                  " ",
                  L.withdrawalAvailableAt ? or(L.withdrawalAvailableAt) : "—"
                ] }),
                /* @__PURE__ */ e("p", { children: "Are you sure you want to process this withdrawal early?" })
              ] }),
              /* @__PURE__ */ i("div", { className: "cedros-admin-modal-actions", children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-outline",
                    onClick: () => T(null),
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-danger",
                    onClick: () => J(L, !0),
                    disabled: S === L.id,
                    children: S === L.id ? "Processing..." : "Process Early"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    E && /* @__PURE__ */ e(
      "div",
      {
        className: `cedros-admin-result cedros-admin-result-${E.type}`,
        role: "status",
        "aria-live": "polite",
        children: E.message
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-admin-withdrawal-queue-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-withdrawal-queue-title", children: "Pending Withdrawals" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-withdrawal-queue-actions", children: [
        /* @__PURE__ */ i("span", { className: "cedros-admin-queue-count", children: [
          g,
          " pending"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
            onClick: R,
            disabled: p || x,
            title: "Refresh queue",
            "aria-label": "Refresh queue",
            children: p && !x ? "..." : "↻"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: K,
            disabled: p || x || w.length === 0,
            title: "Process all ready withdrawals",
            children: x ? "Processing..." : "Process All"
          }
        )
      ] })
    ] }),
    w.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No pending withdrawals." }) }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-withdrawal-table", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-withdrawal-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: "User" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: "Amount" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: "Ready Since" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: "Waiting" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th cedros-admin-withdrawal-th-action", children: "Action" })
        ] }),
        w.map((B) => {
          const q = ir(B.withdrawalAvailableAt), O = S === B.id;
          return /* @__PURE__ */ i(
            "div",
            {
              className: `cedros-admin-withdrawal-row ${q ? "cedros-admin-withdrawal-row-early" : ""}`,
              onClick: () => n?.(B),
              onKeyDown: (H) => {
                (H.key === "Enter" || H.key === " ") && (H.preventDefault(), n?.(B));
              },
              role: n ? "button" : void 0,
              tabIndex: n ? 0 : void 0,
              children: [
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", title: B.userId, children: ar(B.userId) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", children: nr(B.amountLamports) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", children: B.withdrawalAvailableAt ? or(B.withdrawalAvailableAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-waiting", children: B.withdrawalAvailableAt ? q ? "In privacy period" : ma(B.withdrawalAvailableAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-td-action", children: /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: `cedros-button cedros-button-sm ${q ? "cedros-button-warning" : "cedros-button-primary"}`,
                    onClick: (H) => {
                      H.stopPropagation(), J(B);
                    },
                    disabled: O || x,
                    title: q ? "Early withdrawal (requires confirmation)" : "Process this withdrawal",
                    children: O ? "..." : q ? "Early" : "Process"
                  }
                ) })
              ]
            },
            B.id
          );
        })
      ] }),
      F > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => U(_ - 1),
            disabled: _ <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          _,
          " of ",
          F,
          " (",
          g,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => U(_ + 1),
            disabled: _ >= F,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function fa(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function ga(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function wa(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function ya(t) {
  const r = new Date(t), s = /* @__PURE__ */ new Date(), a = r.getTime() - s.getTime();
  if (a <= 0) return "Ready";
  const n = Math.floor(a / 6e4), o = Math.floor(n / 60), l = Math.floor(o / 24);
  if (l > 0) {
    const c = o % 24;
    return c > 0 ? `${l}d ${c}h` : `${l}d`;
  }
  if (o > 0) {
    const c = n % 60;
    return c > 0 ? `${o}h ${c}m` : `${o}h`;
  }
  return `${n}m`;
}
function ba({
  pageSize: t = 20,
  refreshInterval: r = 0,
  className: s = "",
  onLoad: a,
  onItemClick: n
}) {
  const { listInPrivacyPeriod: o, isLoading: l, error: c, clearError: d } = De(), [u, p] = N([]), [f, h] = N(0), [w, m] = N(0), [g, y] = N(null), A = C(async () => {
    try {
      const S = await o({ limit: t, offset: w });
      p(S.deposits), h(S.total), a?.(S), y(null);
    } catch (S) {
      y(S instanceof Error ? S.message : "Failed to load deposits");
    }
  }, [t, w, o, a]);
  I(() => {
    m(0);
  }, [t]), I(() => {
    A();
  }, [A]), I(() => {
    if (r <= 0) return;
    const S = setInterval(A, r);
    return () => clearInterval(S);
  }, [r, A]);
  const v = Math.ceil(f / t), k = Math.floor(w / t) + 1, P = (S) => {
    const b = (S - 1) * t;
    m(Math.max(0, Math.min(b, Math.max(0, f - 1))));
  };
  return g || c ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-error ${s}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: g || c }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              d(), y(null), A();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : l && u.length === 0 ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-loading ${s}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { className: `cedros-admin-privacy-deposits ${s}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-privacy-deposits-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-privacy-deposits-title", children: "In Privacy Period" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-privacy-deposits-actions", children: [
        /* @__PURE__ */ i("span", { className: "cedros-admin-queue-count", children: [
          f,
          " deposit",
          f !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
            onClick: A,
            disabled: l,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: l ? "..." : "↻"
          }
        )
      ] })
    ] }),
    u.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No deposits in privacy period." }) }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-privacy-table", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-privacy-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: "User" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: "Amount" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: "Deposited" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: "Ready In" })
        ] }),
        u.map((S) => /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-admin-privacy-row",
            onClick: () => n?.(S),
            onKeyDown: (b) => {
              (b.key === "Enter" || b.key === " ") && (b.preventDefault(), n?.(S));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", title: S.userId, children: wa(S.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", children: fa(S.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", children: S.completedAt ? ga(S.completedAt) : "—" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td cedros-admin-privacy-remaining", children: S.withdrawalAvailableAt ? ya(S.withdrawalAvailableAt) : "—" })
            ]
          },
          S.id
        ))
      ] }),
      v > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => P(k - 1),
            disabled: k <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          k,
          " of ",
          v,
          " (",
          f,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => P(k + 1),
            disabled: k >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function va(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function Aa(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Na(t) {
  return t.length <= 16 ? t : `${t.slice(0, 8)}...${t.slice(-6)}`;
}
function ka(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function Ca({
  pageSize: t = 20,
  refreshInterval: r = 0,
  className: s = "",
  onLoad: a,
  onItemClick: n
}) {
  const { listDeposits: o, isLoading: l, error: c, clearError: d } = De(), [u, p] = N([]), [f, h] = N(0), [w, m] = N(0), [g, y] = N(null), A = C(async () => {
    try {
      const S = await o({ status: "withdrawn", limit: t, offset: w });
      p(S.deposits), h(S.total), a?.(S), y(null);
    } catch (S) {
      y(S instanceof Error ? S.message : "Failed to load withdrawal history");
    }
  }, [t, w, o, a]);
  I(() => {
    m(0);
  }, [t]), I(() => {
    A();
  }, [A]), I(() => {
    if (r <= 0) return;
    const S = setInterval(A, r);
    return () => clearInterval(S);
  }, [r, A]);
  const v = Math.ceil(f / t), k = Math.floor(w / t) + 1, P = (S) => {
    const b = (S - 1) * t;
    m(Math.max(0, Math.min(b, Math.max(0, f - 1))));
  };
  return g || c ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-error ${s}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: g || c }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              d(), y(null), A();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : l && u.length === 0 ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-loading ${s}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal history..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { className: `cedros-admin-withdrawal-history ${s}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-withdrawal-history-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-withdrawal-history-title", children: "Withdrawal History" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-withdrawal-history-actions", children: [
        /* @__PURE__ */ i("span", { className: "cedros-admin-queue-count", children: [
          f,
          " withdrawal",
          f !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
            onClick: A,
            disabled: l,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: l ? "..." : "↻"
          }
        )
      ] })
    ] }),
    u.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No withdrawals processed yet." }) }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-history-table", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-history-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: "User" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: "Amount" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: "Processed" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: "Transaction" })
        ] }),
        u.map((S) => /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-admin-history-row",
            onClick: () => n?.(S),
            onKeyDown: (b) => {
              (b.key === "Enter" || b.key === " ") && (b.preventDefault(), n?.(S));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", title: S.userId, children: ka(S.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: va(S.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: S.completedAt ? Aa(S.completedAt) : "—" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: S.withdrawalTxSignature ? /* @__PURE__ */ e(
                "a",
                {
                  href: `https://orbmarkets.io/tx/${S.withdrawalTxSignature}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "cedros-admin-tx-link",
                  onClick: (b) => b.stopPropagation(),
                  title: S.withdrawalTxSignature,
                  children: Na(S.withdrawalTxSignature)
                }
              ) : "—" })
            ]
          },
          S.id
        ))
      ] }),
      v > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => P(k - 1),
            disabled: k <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          k,
          " of ",
          v,
          " (",
          f,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => P(k + 1),
            disabled: k >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Ea({
  refreshInterval: t = 0,
  className: r = "",
  onLoad: s
}) {
  const { getPrivacyStatus: a, isLoading: n, error: o, clearError: l } = De(), [c, d] = N(null), [u, p] = N(null), f = C(async () => {
    try {
      const w = await a();
      d(w), s?.(w), p(null);
    } catch (w) {
      p(w instanceof Error ? w.message : "Failed to load status");
    }
  }, [a, s]);
  if (I(() => {
    f();
  }, [f]), I(() => {
    if (t <= 0) return;
    const w = setInterval(f, t);
    return () => clearInterval(w);
  }, [t, f]), u || o)
    return /* @__PURE__ */ i("div", { className: `cedros-admin-status cedros-admin-status-error ${r}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: u || o }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            l(), p(null), f();
          },
          children: "Retry"
        }
      )
    ] });
  if (n && !c)
    return /* @__PURE__ */ i("div", { className: `cedros-admin-status cedros-admin-status-loading ${r}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading system status..." })
    ] });
  if (!c)
    return null;
  const h = c.partialWithdrawalCount > 0;
  return /* @__PURE__ */ i("div", { className: `cedros-admin-status ${r}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-status-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-status-title", children: "System Configuration" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-status-actions", children: [
        /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge ${c.enabled ? "cedros-admin-status-badge-enabled" : "cedros-admin-status-badge-disabled"}`,
            children: c.enabled ? "Enabled" : "Disabled"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
            onClick: f,
            disabled: n,
            title: "Refresh status",
            "aria-label": "Refresh status",
            children: n ? "..." : "↻"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-status-grid", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-status-section", children: [
        /* @__PURE__ */ e("h5", { className: "cedros-admin-status-section-title", children: "Core Settings" }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Privacy Period" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-value", children: c.privacyPeriodDisplay })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Min Deposit" }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-status-value", children: [
            c.minDepositSol,
            " SOL"
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Company Currency" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-value", children: c.companyCurrency })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-status-section", children: [
        /* @__PURE__ */ i("h5", { className: "cedros-admin-status-section-title", children: [
          "Partial Withdrawals",
          /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-status-badge cedros-admin-status-badge-sm ${h ? "cedros-admin-status-badge-enabled" : "cedros-admin-status-badge-disabled"}`,
              children: h ? "On" : "Off"
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Withdrawal %" }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-status-value", children: [
            c.withdrawalPercentage,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Max per Batch" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-value", children: c.partialWithdrawalCount === 0 ? "N/A" : c.partialWithdrawalCount })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Min Amount" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-value", children: c.partialWithdrawalCount === 0 ? "N/A" : `${c.partialWithdrawalMinSol} SOL` })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-status-section", children: [
        /* @__PURE__ */ e("h5", { className: "cedros-admin-status-section-title", children: "Worker Settings" }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Poll Interval" }),
          /* @__PURE__ */ i("span", { className: "cedros-admin-status-value", children: [
            c.withdrawalPollIntervalSecs,
            "s"
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Batch Size" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-value", children: c.withdrawalBatchSize })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-status-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Sidecar Status" }),
          /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-status-value ${c.sidecarStatus === "connected" ? "cedros-admin-status-connected" : "cedros-admin-status-disconnected"}`,
              children: c.sidecarStatus
            }
          )
        ] })
      ] })
    ] }),
    c.companyWallet && /* @__PURE__ */ i("div", { className: "cedros-admin-status-footer", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-status-label", children: "Company Wallet" }),
      /* @__PURE__ */ i("code", { className: "cedros-admin-status-wallet", title: c.companyWallet, children: [
        c.companyWallet.slice(0, 8),
        "...",
        c.companyWallet.slice(-6)
      ] })
    ] })
  ] });
}
class Sa {
  client;
  constructor(r, s, a, n) {
    this.client = new ie({ baseUrl: r, timeoutMs: s, retryAttempts: a, getAccessToken: n });
  }
  /**
   * List all users in the system
   */
  async listUsers(r) {
    try {
      const s = new URLSearchParams();
      r?.limit && s.set("limit", String(r.limit)), r?.offset && s.set("offset", String(r.offset));
      const a = s.toString(), n = `/admin/users${a ? `?${a}` : ""}`;
      return await this.client.get(n);
    } catch (s) {
      throw W(s, "Failed to list users");
    }
  }
  /**
   * Get a specific user by ID
   */
  async getUser(r) {
    try {
      return await this.client.get(`/admin/users/${r}`);
    } catch (s) {
      throw W(s, "Failed to get user");
    }
  }
  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(r, s) {
    try {
      await this.client.patch(`/admin/users/${r}/system-admin`, { isAdmin: s });
    } catch (a) {
      throw W(a, "Failed to update system admin status");
    }
  }
  /**
   * Update a user's profile
   */
  async updateUser(r, s) {
    try {
      return await this.client.patch(`/admin/users/${r}`, s);
    } catch (a) {
      throw W(a, "Failed to update user");
    }
  }
  /**
   * Delete a user
   */
  async deleteUser(r) {
    try {
      await this.client.delete(`/admin/users/${r}`);
    } catch (s) {
      throw W(s, "Failed to delete user");
    }
  }
  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(r) {
    try {
      await this.client.post(`/admin/users/${r}/force-password-reset`, {});
    } catch (s) {
      throw W(s, "Failed to send password reset email");
    }
  }
  /**
   * Adjust a user's credits
   */
  async adjustCredits(r, s) {
    try {
      await this.client.post(`/admin/users/${r}/credits`, s);
    } catch (a) {
      throw W(a, "Failed to adjust credits");
    }
  }
  /**
   * Get a user's deposit history
   */
  async getUserDeposits(r, s) {
    try {
      const a = new URLSearchParams();
      s?.limit && a.set("limit", String(s.limit)), s?.offset && a.set("offset", String(s.offset));
      const n = a.toString(), o = `/admin/users/${r}/deposits${n ? `?${n}` : ""}`;
      return await this.client.get(o);
    } catch (a) {
      throw W(a, "Failed to get user deposits");
    }
  }
  /**
   * Get a user's credit stats and transaction history
   */
  async getUserCredits(r, s) {
    try {
      const a = new URLSearchParams();
      s?.limit && a.set("limit", String(s.limit)), s?.offset && a.set("offset", String(s.offset));
      const n = a.toString(), o = `/admin/users/${r}/credits${n ? `?${n}` : ""}`;
      return await this.client.get(o);
    } catch (a) {
      throw W(a, "Failed to get user credits");
    }
  }
  /**
   * Get a user's withdrawal history
   */
  async getUserWithdrawalHistory(r, s) {
    try {
      const a = new URLSearchParams();
      s?.limit && a.set("limit", String(s.limit)), s?.offset && a.set("offset", String(s.offset));
      const n = a.toString(), o = `/admin/users/${r}/withdrawal-history${n ? `?${n}` : ""}`;
      return await this.client.get(o);
    } catch (a) {
      throw W(a, "Failed to get user withdrawal history");
    }
  }
}
function fs() {
  const { config: t, _internal: r } = se(), [s, a] = N([]), [n, o] = N(0), [l, c] = N(!1), [d, u] = N(null), [p, f] = N({}), h = $(
    () => new Sa(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      r?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), w = C(
    async (E) => {
      c(!0), u(null), f(E || {});
      try {
        const D = await h.listUsers(E);
        return a(D.users), o(D.total), D;
      } catch (D) {
        const L = D instanceof Error ? D : new Error("Failed to list users");
        throw u(L), L;
      } finally {
        c(!1);
      }
    },
    [h]
  ), m = C(
    async (E) => {
      c(!0), u(null);
      try {
        return await h.getUser(E);
      } catch (D) {
        const L = D instanceof Error ? D : new Error("Failed to get user");
        throw u(L), L;
      } finally {
        c(!1);
      }
    },
    [h]
  ), g = C(
    async (E, D) => {
      c(!0), u(null);
      try {
        await h.setSystemAdmin(E, D), a(
          (L) => L.map((T) => T.id === E ? { ...T, isSystemAdmin: D } : T)
        );
      } catch (L) {
        const T = L instanceof Error ? L : new Error("Failed to update admin status");
        throw u(T), T;
      } finally {
        c(!1);
      }
    },
    [h]
  ), y = C(
    async (E, D) => {
      c(!0), u(null);
      try {
        const L = await h.updateUser(E, D);
        return a((T) => T.map((R) => R.id === E ? L : R)), L;
      } catch (L) {
        const T = L instanceof Error ? L : new Error("Failed to update user");
        throw u(T), T;
      } finally {
        c(!1);
      }
    },
    [h]
  ), A = C(
    async (E) => {
      c(!0), u(null);
      try {
        await h.deleteUser(E), a((D) => D.filter((L) => L.id !== E)), o((D) => D - 1);
      } catch (D) {
        const L = D instanceof Error ? D : new Error("Failed to delete user");
        throw u(L), L;
      } finally {
        c(!1);
      }
    },
    [h]
  ), v = C(
    async (E) => {
      c(!0), u(null);
      try {
        await h.forcePasswordReset(E);
      } catch (D) {
        const L = D instanceof Error ? D : new Error("Failed to send password reset");
        throw u(L), L;
      } finally {
        c(!1);
      }
    },
    [h]
  ), k = C(
    async (E, D, L) => {
      c(!0), u(null);
      try {
        await h.adjustCredits(E, { amount: D, reason: L });
      } catch (T) {
        const R = T instanceof Error ? T : new Error("Failed to adjust credits");
        throw u(R), R;
      } finally {
        c(!1);
      }
    },
    [h]
  ), P = C(
    async (E, D) => {
      c(!0), u(null);
      try {
        return await h.getUserDeposits(E, D);
      } catch (L) {
        const T = L instanceof Error ? L : new Error("Failed to get user deposits");
        throw u(T), T;
      } finally {
        c(!1);
      }
    },
    [h]
  ), S = C(
    async (E, D) => {
      c(!0), u(null);
      try {
        return await h.getUserCredits(E, D);
      } catch (L) {
        const T = L instanceof Error ? L : new Error("Failed to get user credits");
        throw u(T), T;
      } finally {
        c(!1);
      }
    },
    [h]
  ), b = C(
    async (E, D) => {
      c(!0), u(null);
      try {
        return await h.getUserWithdrawalHistory(E, D);
      } catch (L) {
        const T = L instanceof Error ? L : new Error("Failed to get user withdrawal history");
        throw u(T), T;
      } finally {
        c(!1);
      }
    },
    [h]
  ), x = C(async () => {
    await w(p);
  }, [w, p]), M = C(() => {
    u(null);
  }, []);
  return {
    users: s,
    total: n,
    isLoading: l,
    error: d,
    listUsers: w,
    getUser: m,
    setSystemAdmin: g,
    updateUser: y,
    deleteUser: A,
    forcePasswordReset: v,
    adjustCredits: k,
    getUserDeposits: P,
    getUserCredits: S,
    getUserWithdrawalHistory: b,
    refresh: x,
    clearError: M
  };
}
function Pa(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function xa(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function La({
  pageSize: t = 20,
  refreshInterval: r = 0,
  currentUserId: s,
  className: a = "",
  onLoad: n,
  onUserClick: o,
  onEditUser: l,
  onAdjustCredits: c
}) {
  const {
    users: d,
    total: u,
    isLoading: p,
    error: f,
    listUsers: h,
    setSystemAdmin: w,
    deleteUser: m,
    forcePasswordReset: g,
    clearError: y
  } = fs(), [A, v] = N(0), [k, P] = N(null), [S, b] = N(null), [x, M] = N(null), E = C(async () => {
    try {
      const U = await h({ limit: t, offset: A });
      n?.(U), P(null);
    } catch (U) {
      P(U instanceof Error ? U.message : "Failed to load users");
    }
  }, [t, A, h, n]);
  I(() => {
    v(0);
  }, [t]), I(() => {
    E();
  }, [E]), I(() => {
    if (r <= 0) return;
    const U = setInterval(E, r);
    return () => clearInterval(U);
  }, [r, E]);
  const D = Math.ceil(u / t), L = Math.floor(A / t) + 1, T = (U) => {
    const J = (U - 1) * t;
    v(Math.max(0, Math.min(J, Math.max(0, u - 1))));
  }, R = async (U) => {
    if (U.id === s) {
      alert("You cannot change your own admin status");
      return;
    }
    const J = U.isSystemAdmin ? "remove admin privileges from" : "grant admin privileges to";
    if (window.confirm(
      `Are you sure you want to ${J} ${U.name || U.email || "this user"}?`
    )) {
      b(U.id);
      try {
        await w(U.id, !U.isSystemAdmin);
      } catch {
      } finally {
        b(null);
      }
    }
  }, F = async (U) => {
    if (U.id === s) {
      alert("You cannot delete your own account");
      return;
    }
    if (U.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${U.name || U.email || "this user"}? This action cannot be undone.`
    )) {
      M(U.id);
      try {
        await m(U.id);
      } catch {
      } finally {
        M(null);
      }
    }
  }, _ = async (U) => {
    if (!U.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${U.email}?`)) {
      M(U.id);
      try {
        await g(U.id), alert("Password reset email sent");
      } catch {
      } finally {
        M(null);
      }
    }
  };
  return k || f ? /* @__PURE__ */ i("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${a}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: k || f?.message }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          y(), P(null), E();
        },
        children: "Retry"
      }
    )
  ] }) : p && d.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${a}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-admin-user-list ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-user-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-user-list-title", children: "All Users" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-user-list-actions", children: [
        /* @__PURE__ */ i("span", { className: "cedros-admin-queue-count", children: [
          u,
          " user",
          u !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-icon-button",
            onClick: E,
            disabled: p,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: p ? "..." : "↻"
          }
        )
      ] })
    ] }),
    d.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: "User" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: "Auth Methods" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: "Registered" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th cedros-admin-user-th-admin", children: "Admin" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th cedros-admin-user-th-actions", children: "Actions" })
        ] }),
        d.map((U) => {
          const J = U.id === s, K = S === U.id;
          return /* @__PURE__ */ i(
            "div",
            {
              className: `cedros-admin-user-row ${J ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => o?.(U),
              onKeyDown: (B) => {
                (B.key === "Enter" || B.key === " ") && (B.preventDefault(), o?.(U));
              },
              role: o ? "button" : void 0,
              tabIndex: o ? 0 : void 0,
              children: [
                /* @__PURE__ */ i("div", { className: "cedros-admin-user-td cedros-admin-user-info", children: [
                  /* @__PURE__ */ e("div", { className: "cedros-admin-user-avatar", children: U.picture ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: U.picture,
                      alt: U.name || U.email || "User",
                      className: "cedros-admin-user-avatar-img",
                      referrerPolicy: "no-referrer"
                    }
                  ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-avatar-placeholder", children: (U.name?.[0] || U.email?.[0] || "?").toUpperCase() }) }),
                  /* @__PURE__ */ i("div", { className: "cedros-admin-user-details", children: [
                    /* @__PURE__ */ i("span", { className: "cedros-admin-user-name", children: [
                      U.name || "Unknown",
                      J && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
                    ] }),
                    /* @__PURE__ */ e("span", { className: "cedros-admin-user-email", title: U.email, children: U.email || xa(U.id) })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td cedros-admin-user-methods", children: U.authMethods.length > 0 ? U.authMethods.map((B) => /* @__PURE__ */ e(
                  "span",
                  {
                    className: `cedros-admin-auth-badge cedros-admin-auth-badge-${B}`,
                    children: B
                  },
                  B
                )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" }) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: Pa(U.createdAt) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td cedros-admin-user-td-admin", children: /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: `cedros-admin-toggle ${U.isSystemAdmin ? "cedros-admin-toggle-on" : "cedros-admin-toggle-off"}`,
                    onClick: (B) => {
                      B.stopPropagation(), R(U);
                    },
                    disabled: K || J,
                    title: J ? "Cannot change your own status" : U.isSystemAdmin ? "Revoke admin" : "Grant admin",
                    "aria-label": U.isSystemAdmin ? "Revoke admin" : "Grant admin",
                    children: K ? "..." : U.isSystemAdmin ? "Yes" : "No"
                  }
                ) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td cedros-admin-user-td-actions", children: x === U.id ? /* @__PURE__ */ e("span", { className: "cedros-admin-action-loading", children: "..." }) : /* @__PURE__ */ i("div", { className: "cedros-admin-action-buttons", children: [
                  l && /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      className: "cedros-admin-action-btn",
                      onClick: (B) => {
                        B.stopPropagation(), l(U);
                      },
                      title: "Edit user",
                      "aria-label": "Edit user",
                      children: "Edit"
                    }
                  ),
                  U.email && /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      className: "cedros-admin-action-btn",
                      onClick: (B) => {
                        B.stopPropagation(), _(U);
                      },
                      title: "Send password reset",
                      "aria-label": "Send password reset",
                      children: "Reset"
                    }
                  ),
                  c && /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      className: "cedros-admin-action-btn",
                      onClick: (B) => {
                        B.stopPropagation(), c(U);
                      },
                      title: "Adjust credits",
                      "aria-label": "Adjust credits",
                      children: "Credits"
                    }
                  ),
                  !J && !U.isSystemAdmin && /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      className: "cedros-admin-action-btn cedros-admin-action-btn-danger",
                      onClick: (B) => {
                        B.stopPropagation(), F(U);
                      },
                      title: "Delete user",
                      "aria-label": "Delete user",
                      children: "Delete"
                    }
                  )
                ] }) })
              ]
            },
            U.id
          );
        })
      ] }),
      D > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => T(L - 1),
            disabled: L <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          L,
          " of ",
          D,
          " (",
          u,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => T(L + 1),
            disabled: L >= D,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function cr(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function gs(t) {
  return new Date(t).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ue(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function Ta({
  userId: t,
  onBack: r,
  currentUserId: s,
  onEditUser: a,
  onAdjustCredits: n,
  className: o = ""
}) {
  const {
    isLoading: l,
    getUser: c,
    getUserDeposits: d,
    getUserCredits: u,
    setSystemAdmin: p,
    deleteUser: f,
    forcePasswordReset: h,
    clearError: w
  } = fs(), [m, g] = N(null), [y, A] = N(null), [v, k] = N(null), [P, S] = N("deposits"), [b, x] = N(null), [M, E] = N(null), [D, L] = N(null), [T, R] = N(!1), [F, _] = N(0), [U, J] = N(0), K = 10, B = C(async () => {
    try {
      const G = await c(t);
      g(G), x(null);
    } catch (G) {
      x(G instanceof Error ? G.message : "Failed to load user");
    }
  }, [t, c]), q = C(async () => {
    try {
      const ve = await d(t, { limit: K, offset: F });
      k(ve), L(null);
    } catch (G) {
      L(G instanceof Error ? G.message : "Failed to load deposits");
    }
  }, [t, d, F]), O = C(async () => {
    try {
      const ve = await u(t, { limit: K, offset: U });
      A(ve), E(null);
    } catch (G) {
      E(G instanceof Error ? G.message : "Failed to load credits");
    }
  }, [t, u, U]);
  I(() => {
    B(), q(), O();
  }, [B, q, O]);
  const H = async () => {
    if (!m) return;
    if (m.id === s) {
      alert("You cannot change your own admin status");
      return;
    }
    const G = m.isSystemAdmin ? "remove admin privileges from" : "grant admin privileges to";
    if (window.confirm(
      `Are you sure you want to ${G} ${m.name || m.email || "this user"}?`
    )) {
      R(!0);
      try {
        await p(m.id, !m.isSystemAdmin), await B();
      } catch {
      } finally {
        R(!1);
      }
    }
  }, pe = async () => {
    if (!m) return;
    if (m.id === s) {
      alert("You cannot delete your own account");
      return;
    }
    if (m.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${m.name || m.email || "this user"}? This action cannot be undone.`
    )) {
      R(!0);
      try {
        await f(m.id), r();
      } catch {
      } finally {
        R(!1);
      }
    }
  }, oe = async () => {
    if (!m?.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${m.email}?`)) {
      R(!0);
      try {
        await h(m.id), alert("Password reset email sent");
      } catch {
      } finally {
        R(!1);
      }
    }
  }, fe = v ? Math.ceil(v.total / K) : 0, de = Math.floor(F / K) + 1, V = y ? Math.ceil(y.totalTransactions / K) : 0, z = Math.floor(U / K) + 1, Z = (G) => {
    _((G - 1) * K);
  }, ce = (G) => {
    J((G - 1) * K);
  };
  if (b)
    return /* @__PURE__ */ i("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${o}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: r,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: b }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            w(), x(null), B();
          },
          children: "Retry"
        }
      )
    ] });
  if (l && !m)
    return /* @__PURE__ */ i("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${o}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!m)
    return /* @__PURE__ */ i("div", { className: `cedros-admin-user-detail ${o}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: r,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "User not found." })
    ] });
  const me = m.id === s;
  return /* @__PURE__ */ i("div", { className: `cedros-admin-user-detail ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-header", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn",
          onClick: r,
          children: "Back to Users"
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-actions", children: [
        a && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => a(m),
            disabled: T,
            children: "Edit"
          }
        ),
        m.email && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: oe,
            disabled: T,
            children: "Reset Password"
          }
        ),
        n && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => n(m),
            disabled: T,
            children: "Adjust Credits"
          }
        ),
        !me && !m.isSystemAdmin && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
            onClick: pe,
            disabled: T,
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-info", children: [
      /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-avatar", children: m.picture ? /* @__PURE__ */ e(
        "img",
        {
          src: m.picture,
          alt: m.name || m.email || "User",
          className: "cedros-admin-user-detail-avatar-img",
          referrerPolicy: "no-referrer"
        }
      ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-avatar-placeholder", children: (m.name?.[0] || m.email?.[0] || "?").toUpperCase() }) }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-meta", children: [
        /* @__PURE__ */ i("h2", { className: "cedros-admin-user-detail-name", children: [
          m.name || "Unknown",
          me && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ i("p", { className: "cedros-admin-user-detail-email", children: [
          m.email || "No email",
          m.emailVerified && /* @__PURE__ */ e("span", { className: "cedros-admin-verified-badge", title: "Email verified", children: "Verified" })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-badges", children: [
          /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-admin-badge ${m.isSystemAdmin ? "cedros-admin-admin-badge-yes" : "cedros-admin-admin-badge-no"}`,
              children: m.isSystemAdmin ? "System Admin" : "User"
            }
          ),
          !me && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-xs",
              onClick: H,
              disabled: T,
              children: m.isSystemAdmin ? "Revoke Admin" : "Grant Admin"
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-methods", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-methods-label", children: "Auth Methods:" }),
          m.authMethods.length > 0 ? m.authMethods.map((G) => /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-auth-badge cedros-admin-auth-badge-${G}`,
              children: G
            },
            G
          )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
        ] }),
        /* @__PURE__ */ i("p", { className: "cedros-admin-user-detail-dates", children: [
          "Registered: ",
          cr(m.createdAt),
          " | Updated: ",
          cr(m.updatedAt)
        ] })
      ] })
    ] }),
    M ? /* @__PURE__ */ i("div", { className: "cedros-admin-stats-error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: M }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: () => {
            E(null), O();
          },
          children: "Retry"
        }
      )
    ] }) : y ? /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-stats", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Current Balance" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: Ue(y.stats.currentBalanceLamports) })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Deposited" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: Ue(y.stats.totalDepositedLamports) })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Spent" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: Ue(y.stats.totalSpentLamports) })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Deposits" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: y.stats.depositCount })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Transactions" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: y.stats.spendCount })
      ] })
    ] }) : /* @__PURE__ */ i("div", { className: "cedros-admin-stats-loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { children: "Loading credit stats..." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-tabs", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${P === "deposits" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => S("deposits"),
          children: [
            "Deposits (",
            v?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${P === "transactions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => S("transactions"),
          children: [
            "Transactions (",
            y?.totalTransactions ?? 0,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-user-detail-content", children: [
      P === "deposits" && /* @__PURE__ */ e(
        Da,
        {
          deposits: v?.deposits ?? [],
          total: v?.total ?? 0,
          currentPage: de,
          totalPages: fe,
          onPageChange: Z,
          isLoading: l,
          error: D,
          onRetry: () => {
            L(null), q();
          }
        }
      ),
      P === "transactions" && /* @__PURE__ */ e(
        Ma,
        {
          transactions: y?.transactions ?? [],
          total: y?.totalTransactions ?? 0,
          currentPage: z,
          totalPages: V,
          onPageChange: ce,
          error: M,
          onRetry: () => {
            E(null), O();
          },
          isLoading: l
        }
      )
    ] })
  ] });
}
function Da({
  deposits: t,
  total: r,
  currentPage: s,
  totalPages: a,
  onPageChange: n,
  isLoading: o,
  error: l,
  onRetry: c
}) {
  return l ? /* @__PURE__ */ i("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: l }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : o && t.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading deposits..." })
  ] }) : r === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No deposits found." }) : /* @__PURE__ */ i(te, { children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Address" })
      ] }),
      t.map((d) => /* @__PURE__ */ i("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: Ue(d.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${d.status}`, children: d.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: gs(d.createdAt) }),
        /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-admin-list-td cedros-admin-list-td-mono",
            title: d.walletAddress,
            children: [
              d.walletAddress.slice(0, 8),
              "...",
              d.walletAddress.slice(-4)
            ]
          }
        )
      ] }, d.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      ws,
      {
        currentPage: s,
        totalPages: a,
        total: r,
        onPageChange: n
      }
    )
  ] });
}
function Ma({
  transactions: t,
  total: r,
  currentPage: s,
  totalPages: a,
  onPageChange: n,
  isLoading: o,
  error: l,
  onRetry: c
}) {
  return l ? /* @__PURE__ */ i("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: l }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : o && t.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading transactions..." })
  ] }) : r === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No transactions found." }) : /* @__PURE__ */ i(te, { children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Type" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Reference" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" })
      ] }),
      t.map((d) => /* @__PURE__ */ i("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-admin-list-td ${d.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              d.amountLamports >= 0 ? "+" : "",
              Ue(d.amountLamports)
            ]
          }
        ),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${d.txType.toLowerCase()}`,
            children: d.txType
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: d.referenceType || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: gs(d.createdAt) })
      ] }, d.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      ws,
      {
        currentPage: s,
        totalPages: a,
        total: r,
        onPageChange: n
      }
    )
  ] });
}
function ws({ currentPage: t, totalPages: r, total: s, onPageChange: a }) {
  return /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => a(t - 1),
        disabled: t <= 1,
        children: "Previous"
      }
    ),
    /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
      "Page ",
      t,
      " of ",
      r,
      " (",
      s,
      " total)"
    ] }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => a(t + 1),
        disabled: t >= r,
        children: "Next"
      }
    )
  ] });
}
const we = {
  overview: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "7", height: "9", rx: "1" }),
        /* @__PURE__ */ e("rect", { x: "14", y: "3", width: "7", height: "5", rx: "1" }),
        /* @__PURE__ */ e("rect", { x: "14", y: "12", width: "7", height: "9", rx: "1" }),
        /* @__PURE__ */ e("rect", { x: "3", y: "16", width: "7", height: "5", rx: "1" })
      ]
    }
  ),
  users: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      ]
    }
  ),
  members: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      ]
    }
  ),
  invites: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
        /* @__PURE__ */ e("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
      ]
    }
  ),
  deposits: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ e("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
        /* @__PURE__ */ e("path", { d: "M12 18V6" })
      ]
    }
  ),
  withdrawals: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("path", { d: "M12 5v14" }),
        /* @__PURE__ */ e("path", { d: "m19 12-7 7-7-7" })
      ]
    }
  ),
  settings: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
        /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
      ]
    }
  ),
  wallet: /* @__PURE__ */ i(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ e("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
        /* @__PURE__ */ e("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
      ]
    }
  ),
  chevronRight: /* @__PURE__ */ e(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" })
    }
  )
}, Ra = [
  { id: "overview", label: "Overview", icon: we.overview },
  { id: "users", label: "Users", icon: we.users },
  { id: "members", label: "Team", icon: we.members },
  { id: "invites", label: "Invites", icon: we.invites },
  { id: "deposits", label: "Deposits", icon: we.deposits },
  { id: "withdrawals", label: "Withdrawals", icon: we.withdrawals },
  { id: "settings", label: "Settings", icon: we.settings }
];
function cc({
  title: t = "Dashboard",
  sections: r = ["overview", "users", "members", "invites", "deposits", "withdrawals", "settings"],
  defaultSection: s = "overview",
  refreshInterval: a = 0,
  pageSize: n = 20,
  onSectionChange: o,
  className: l = ""
}) {
  const [c, d] = N(s), { user: u } = se(), { activeOrg: p, role: f, isLoading: h, fetchOrgs: w, hasPermission: m } = sa();
  I(() => {
    w();
  }, [w]);
  const g = C(
    (k) => {
      d(k), o?.(k);
    },
    [o]
  ), y = Ra.filter((k) => r.includes(k.id));
  if (h && !p)
    return /* @__PURE__ */ i("div", { className: `cedros-dashboard cedros-dashboard--loading ${l}`, children: [
      /* @__PURE__ */ e(ee, {}),
      /* @__PURE__ */ e("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
    ] });
  if (["members", "invites"].includes(c) && !p)
    return /* @__PURE__ */ e("div", { className: `cedros-dashboard ${l}`, children: /* @__PURE__ */ e(ae, { error: "No organization selected. Please select an organization first." }) });
  const v = y.find((k) => k.id === c);
  return /* @__PURE__ */ i("div", { className: `cedros-dashboard ${l}`, children: [
    /* @__PURE__ */ i("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__logo", children: [
        we.wallet,
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__logo-text", children: t })
      ] }) }),
      /* @__PURE__ */ e("nav", { className: "cedros-dashboard__nav", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
        y.map((k) => /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: `cedros-dashboard__nav-item ${c === k.id ? "cedros-dashboard__nav-item--active" : ""}`,
            onClick: () => g(k.id),
            "aria-current": c === k.id ? "page" : void 0,
            children: [
              /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: k.icon }),
              /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: k.label })
            ]
          },
          k.id
        ))
      ] }) }),
      p && /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__org", children: [
        /* @__PURE__ */ e("div", { className: "cedros-dashboard__org-avatar", children: p.name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ i("div", { className: "cedros-dashboard__org-info", children: [
          /* @__PURE__ */ e("span", { className: "cedros-dashboard__org-name", children: p.name }),
          f && /* @__PURE__ */ e("span", { className: "cedros-dashboard__org-role", children: f })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ i("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ e("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-root", children: t }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-sep", children: we.chevronRight }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-current", children: v?.label })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-dashboard__content", children: [
        c === "overview" && /* @__PURE__ */ e(Ba, { refreshInterval: a }),
        c === "users" && /* @__PURE__ */ e(Ua, { pageSize: n, currentUserId: u?.id }),
        c === "members" && p && /* @__PURE__ */ e(
          Ia,
          {
            orgId: p.id,
            currentUserId: u?.id,
            hasPermission: m
          }
        ),
        c === "invites" && p && /* @__PURE__ */ e(Fa, { orgId: p.id, hasPermission: m }),
        c === "deposits" && /* @__PURE__ */ e(Oa, { pageSize: n, refreshInterval: a }),
        c === "withdrawals" && /* @__PURE__ */ e(Wa, { pageSize: n, refreshInterval: a }),
        c === "settings" && /* @__PURE__ */ e(qa, {})
      ] })
    ] })
  ] });
}
function Ba({ refreshInterval: t }) {
  const { getBalance: r, isLoading: s } = jt(), [a, n] = N(null);
  return I(() => {
    r().then((o) => n(o.display)).catch(() => n(null));
  }, [r]), /* @__PURE__ */ i("div", { className: "cedros-dashboard__overview", children: [
    /* @__PURE__ */ e("div", { className: "cedros-dashboard__cards", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__card", children: [
      /* @__PURE__ */ i("div", { className: "cedros-dashboard__card-header", children: [
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__card-title", children: "Credit Balance" }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__card-icon", children: we.wallet })
      ] }),
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__card-value", children: s ? "..." : a ?? "—" }),
      /* @__PURE__ */ e("p", { className: "cedros-dashboard__card-desc", children: "Available credits for services" })
    ] }) }),
    /* @__PURE__ */ e(Ea, { refreshInterval: t }),
    /* @__PURE__ */ e(ps, { refreshInterval: t })
  ] });
}
function Ua({ pageSize: t, currentUserId: r }) {
  const [s, a] = N(null);
  return s ? /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
    Ta,
    {
      userId: s.id,
      currentUserId: r,
      onBack: () => a(null)
    }
  ) }) : /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "All registered users in the system. Requires system admin privileges." }),
    /* @__PURE__ */ e(
      La,
      {
        pageSize: t,
        currentUserId: r,
        onUserClick: (n) => a(n)
      }
    )
  ] });
}
function Ia({ orgId: t, currentUserId: r, hasPermission: s }) {
  const { members: a, isLoading: n, error: o, fetchMembers: l, updateMemberRole: c, removeMember: d } = oa(t);
  return I(() => {
    l();
  }, [l]), /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
    Gn,
    {
      members: a,
      currentUserId: r,
      isLoading: n,
      error: o?.message,
      canManage: s("member:remove"),
      canChangeRoles: s("member:role_change"),
      onUpdateRole: c,
      onRemove: d
    }
  ) });
}
function Fa({ orgId: t, hasPermission: r }) {
  const { invites: s, isLoading: a, error: n, fetchInvites: o, createInvite: l, cancelInvite: c, resendInvite: d } = ia(t);
  I(() => {
    o();
  }, [o]);
  const u = r("invite:create"), p = r("invite:cancel");
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__invites", children: [
    u && /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
      /* @__PURE__ */ e(to, { onSubmit: l, isLoading: a, error: n?.message })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Pending Invitations" }) }),
      /* @__PURE__ */ e(
        so,
        {
          invites: s,
          isLoading: a,
          error: n?.message,
          canManage: p || u,
          onCancel: p ? c : void 0,
          onResend: u ? d : void 0
        }
      )
    ] })
  ] });
}
function Oa({ pageSize: t, refreshInterval: r }) {
  const [s, a] = N("");
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ e(ps, { refreshInterval: r }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ e("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ i(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: s,
            onChange: (n) => a(n.target.value),
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ e("option", { value: "pending", children: "Pending" }),
              /* @__PURE__ */ e("option", { value: "detected", children: "Detected" }),
              /* @__PURE__ */ e("option", { value: "processing", children: "Processing" }),
              /* @__PURE__ */ e("option", { value: "completed", children: "Completed" }),
              /* @__PURE__ */ e("option", { value: "withdrawn", children: "Withdrawn" }),
              /* @__PURE__ */ e("option", { value: "expired", children: "Expired" }),
              /* @__PURE__ */ e("option", { value: "failed", children: "Failed" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ e(
        ha,
        {
          statusFilter: s || void 0,
          pageSize: t,
          refreshInterval: r
        }
      )
    ] })
  ] });
}
function Wa({ pageSize: t, refreshInterval: r }) {
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ e(ba, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(pa, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(Ca, { pageSize: t, refreshInterval: r })
    ] })
  ] });
}
function qa() {
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "Configure system-wide settings. Changes take effect immediately." }),
    /* @__PURE__ */ e(Ho, { showDescriptions: !0 })
  ] });
}
var Ee = {}, lt, lr;
function _a() {
  return lr || (lr = 1, lt = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), lt;
}
var dt = {}, Ae = {}, dr;
function Ne() {
  if (dr) return Ae;
  dr = 1;
  let t;
  const r = [
    0,
    // Not used
    26,
    44,
    70,
    100,
    134,
    172,
    196,
    242,
    292,
    346,
    404,
    466,
    532,
    581,
    655,
    733,
    815,
    901,
    991,
    1085,
    1156,
    1258,
    1364,
    1474,
    1588,
    1706,
    1828,
    1921,
    2051,
    2185,
    2323,
    2465,
    2611,
    2761,
    2876,
    3034,
    3196,
    3362,
    3532,
    3706
  ];
  return Ae.getSymbolSize = function(a) {
    if (!a) throw new Error('"version" cannot be null or undefined');
    if (a < 1 || a > 40) throw new Error('"version" should be in range from 1 to 40');
    return a * 4 + 17;
  }, Ae.getSymbolTotalCodewords = function(a) {
    return r[a];
  }, Ae.getBCHDigit = function(s) {
    let a = 0;
    for (; s !== 0; )
      a++, s >>>= 1;
    return a;
  }, Ae.setToSJISFunction = function(a) {
    if (typeof a != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    t = a;
  }, Ae.isKanjiModeEnabled = function() {
    return typeof t < "u";
  }, Ae.toSJIS = function(a) {
    return t(a);
  }, Ae;
}
var ut = {}, ur;
function $t() {
  return ur || (ur = 1, (function(t) {
    t.L = { bit: 1 }, t.M = { bit: 0 }, t.Q = { bit: 3 }, t.H = { bit: 2 };
    function r(s) {
      if (typeof s != "string")
        throw new Error("Param is not a string");
      switch (s.toLowerCase()) {
        case "l":
        case "low":
          return t.L;
        case "m":
        case "medium":
          return t.M;
        case "q":
        case "quartile":
          return t.Q;
        case "h":
        case "high":
          return t.H;
        default:
          throw new Error("Unknown EC Level: " + s);
      }
    }
    t.isValid = function(a) {
      return a && typeof a.bit < "u" && a.bit >= 0 && a.bit < 4;
    }, t.from = function(a, n) {
      if (t.isValid(a))
        return a;
      try {
        return r(a);
      } catch {
        return n;
      }
    };
  })(ut)), ut;
}
var ht, hr;
function ja() {
  if (hr) return ht;
  hr = 1;
  function t() {
    this.buffer = [], this.length = 0;
  }
  return t.prototype = {
    get: function(r) {
      const s = Math.floor(r / 8);
      return (this.buffer[s] >>> 7 - r % 8 & 1) === 1;
    },
    put: function(r, s) {
      for (let a = 0; a < s; a++)
        this.putBit((r >>> s - a - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(r) {
      const s = Math.floor(this.length / 8);
      this.buffer.length <= s && this.buffer.push(0), r && (this.buffer[s] |= 128 >>> this.length % 8), this.length++;
    }
  }, ht = t, ht;
}
var mt, mr;
function $a() {
  if (mr) return mt;
  mr = 1;
  function t(r) {
    if (!r || r < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = r, this.data = new Uint8Array(r * r), this.reservedBit = new Uint8Array(r * r);
  }
  return t.prototype.set = function(r, s, a, n) {
    const o = r * this.size + s;
    this.data[o] = a, n && (this.reservedBit[o] = !0);
  }, t.prototype.get = function(r, s) {
    return this.data[r * this.size + s];
  }, t.prototype.xor = function(r, s, a) {
    this.data[r * this.size + s] ^= a;
  }, t.prototype.isReserved = function(r, s) {
    return this.reservedBit[r * this.size + s];
  }, mt = t, mt;
}
var pt = {}, pr;
function za() {
  return pr || (pr = 1, (function(t) {
    const r = Ne().getSymbolSize;
    t.getRowColCoords = function(a) {
      if (a === 1) return [];
      const n = Math.floor(a / 7) + 2, o = r(a), l = o === 145 ? 26 : Math.ceil((o - 13) / (2 * n - 2)) * 2, c = [o - 7];
      for (let d = 1; d < n - 1; d++)
        c[d] = c[d - 1] - l;
      return c.push(6), c.reverse();
    }, t.getPositions = function(a) {
      const n = [], o = t.getRowColCoords(a), l = o.length;
      for (let c = 0; c < l; c++)
        for (let d = 0; d < l; d++)
          c === 0 && d === 0 || // top-left
          c === 0 && d === l - 1 || // bottom-left
          c === l - 1 && d === 0 || n.push([o[c], o[d]]);
      return n;
    };
  })(pt)), pt;
}
var ft = {}, fr;
function Va() {
  if (fr) return ft;
  fr = 1;
  const t = Ne().getSymbolSize, r = 7;
  return ft.getPositions = function(a) {
    const n = t(a);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - r, 0],
      // bottom-left
      [0, n - r]
    ];
  }, ft;
}
var gt = {}, gr;
function Qa() {
  return gr || (gr = 1, (function(t) {
    t.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    const r = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    t.isValid = function(n) {
      return n != null && n !== "" && !isNaN(n) && n >= 0 && n <= 7;
    }, t.from = function(n) {
      return t.isValid(n) ? parseInt(n, 10) : void 0;
    }, t.getPenaltyN1 = function(n) {
      const o = n.size;
      let l = 0, c = 0, d = 0, u = null, p = null;
      for (let f = 0; f < o; f++) {
        c = d = 0, u = p = null;
        for (let h = 0; h < o; h++) {
          let w = n.get(f, h);
          w === u ? c++ : (c >= 5 && (l += r.N1 + (c - 5)), u = w, c = 1), w = n.get(h, f), w === p ? d++ : (d >= 5 && (l += r.N1 + (d - 5)), p = w, d = 1);
        }
        c >= 5 && (l += r.N1 + (c - 5)), d >= 5 && (l += r.N1 + (d - 5));
      }
      return l;
    }, t.getPenaltyN2 = function(n) {
      const o = n.size;
      let l = 0;
      for (let c = 0; c < o - 1; c++)
        for (let d = 0; d < o - 1; d++) {
          const u = n.get(c, d) + n.get(c, d + 1) + n.get(c + 1, d) + n.get(c + 1, d + 1);
          (u === 4 || u === 0) && l++;
        }
      return l * r.N2;
    }, t.getPenaltyN3 = function(n) {
      const o = n.size;
      let l = 0, c = 0, d = 0;
      for (let u = 0; u < o; u++) {
        c = d = 0;
        for (let p = 0; p < o; p++)
          c = c << 1 & 2047 | n.get(u, p), p >= 10 && (c === 1488 || c === 93) && l++, d = d << 1 & 2047 | n.get(p, u), p >= 10 && (d === 1488 || d === 93) && l++;
      }
      return l * r.N3;
    }, t.getPenaltyN4 = function(n) {
      let o = 0;
      const l = n.data.length;
      for (let d = 0; d < l; d++) o += n.data[d];
      return Math.abs(Math.ceil(o * 100 / l / 5) - 10) * r.N4;
    };
    function s(a, n, o) {
      switch (a) {
        case t.Patterns.PATTERN000:
          return (n + o) % 2 === 0;
        case t.Patterns.PATTERN001:
          return n % 2 === 0;
        case t.Patterns.PATTERN010:
          return o % 3 === 0;
        case t.Patterns.PATTERN011:
          return (n + o) % 3 === 0;
        case t.Patterns.PATTERN100:
          return (Math.floor(n / 2) + Math.floor(o / 3)) % 2 === 0;
        case t.Patterns.PATTERN101:
          return n * o % 2 + n * o % 3 === 0;
        case t.Patterns.PATTERN110:
          return (n * o % 2 + n * o % 3) % 2 === 0;
        case t.Patterns.PATTERN111:
          return (n * o % 3 + (n + o) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + a);
      }
    }
    t.applyMask = function(n, o) {
      const l = o.size;
      for (let c = 0; c < l; c++)
        for (let d = 0; d < l; d++)
          o.isReserved(d, c) || o.xor(d, c, s(n, d, c));
    }, t.getBestMask = function(n, o) {
      const l = Object.keys(t.Patterns).length;
      let c = 0, d = 1 / 0;
      for (let u = 0; u < l; u++) {
        o(u), t.applyMask(u, n);
        const p = t.getPenaltyN1(n) + t.getPenaltyN2(n) + t.getPenaltyN3(n) + t.getPenaltyN4(n);
        t.applyMask(u, n), p < d && (d = p, c = u);
      }
      return c;
    };
  })(gt)), gt;
}
var ze = {}, wr;
function ys() {
  if (wr) return ze;
  wr = 1;
  const t = $t(), r = [
    // L  M  Q  H
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    1,
    2,
    2,
    4,
    1,
    2,
    4,
    4,
    2,
    4,
    4,
    4,
    2,
    4,
    6,
    5,
    2,
    4,
    6,
    6,
    2,
    5,
    8,
    8,
    4,
    5,
    8,
    8,
    4,
    5,
    8,
    11,
    4,
    8,
    10,
    11,
    4,
    9,
    12,
    16,
    4,
    9,
    16,
    16,
    6,
    10,
    12,
    18,
    6,
    10,
    17,
    16,
    6,
    11,
    16,
    19,
    6,
    13,
    18,
    21,
    7,
    14,
    21,
    25,
    8,
    16,
    20,
    25,
    8,
    17,
    23,
    25,
    9,
    17,
    23,
    34,
    9,
    18,
    25,
    30,
    10,
    20,
    27,
    32,
    12,
    21,
    29,
    35,
    12,
    23,
    34,
    37,
    12,
    25,
    34,
    40,
    13,
    26,
    35,
    42,
    14,
    28,
    38,
    45,
    15,
    29,
    40,
    48,
    16,
    31,
    43,
    51,
    17,
    33,
    45,
    54,
    18,
    35,
    48,
    57,
    19,
    37,
    51,
    60,
    19,
    38,
    53,
    63,
    20,
    40,
    56,
    66,
    21,
    43,
    59,
    70,
    22,
    45,
    62,
    74,
    24,
    47,
    65,
    77,
    25,
    49,
    68,
    81
  ], s = [
    // L  M  Q  H
    7,
    10,
    13,
    17,
    10,
    16,
    22,
    28,
    15,
    26,
    36,
    44,
    20,
    36,
    52,
    64,
    26,
    48,
    72,
    88,
    36,
    64,
    96,
    112,
    40,
    72,
    108,
    130,
    48,
    88,
    132,
    156,
    60,
    110,
    160,
    192,
    72,
    130,
    192,
    224,
    80,
    150,
    224,
    264,
    96,
    176,
    260,
    308,
    104,
    198,
    288,
    352,
    120,
    216,
    320,
    384,
    132,
    240,
    360,
    432,
    144,
    280,
    408,
    480,
    168,
    308,
    448,
    532,
    180,
    338,
    504,
    588,
    196,
    364,
    546,
    650,
    224,
    416,
    600,
    700,
    224,
    442,
    644,
    750,
    252,
    476,
    690,
    816,
    270,
    504,
    750,
    900,
    300,
    560,
    810,
    960,
    312,
    588,
    870,
    1050,
    336,
    644,
    952,
    1110,
    360,
    700,
    1020,
    1200,
    390,
    728,
    1050,
    1260,
    420,
    784,
    1140,
    1350,
    450,
    812,
    1200,
    1440,
    480,
    868,
    1290,
    1530,
    510,
    924,
    1350,
    1620,
    540,
    980,
    1440,
    1710,
    570,
    1036,
    1530,
    1800,
    570,
    1064,
    1590,
    1890,
    600,
    1120,
    1680,
    1980,
    630,
    1204,
    1770,
    2100,
    660,
    1260,
    1860,
    2220,
    720,
    1316,
    1950,
    2310,
    750,
    1372,
    2040,
    2430
  ];
  return ze.getBlocksCount = function(n, o) {
    switch (o) {
      case t.L:
        return r[(n - 1) * 4 + 0];
      case t.M:
        return r[(n - 1) * 4 + 1];
      case t.Q:
        return r[(n - 1) * 4 + 2];
      case t.H:
        return r[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, ze.getTotalCodewordsCount = function(n, o) {
    switch (o) {
      case t.L:
        return s[(n - 1) * 4 + 0];
      case t.M:
        return s[(n - 1) * 4 + 1];
      case t.Q:
        return s[(n - 1) * 4 + 2];
      case t.H:
        return s[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, ze;
}
var wt = {}, Be = {}, yr;
function Ha() {
  if (yr) return Be;
  yr = 1;
  const t = new Uint8Array(512), r = new Uint8Array(256);
  return (function() {
    let a = 1;
    for (let n = 0; n < 255; n++)
      t[n] = a, r[a] = n, a <<= 1, a & 256 && (a ^= 285);
    for (let n = 255; n < 512; n++)
      t[n] = t[n - 255];
  })(), Be.log = function(a) {
    if (a < 1) throw new Error("log(" + a + ")");
    return r[a];
  }, Be.exp = function(a) {
    return t[a];
  }, Be.mul = function(a, n) {
    return a === 0 || n === 0 ? 0 : t[r[a] + r[n]];
  }, Be;
}
var br;
function Ka() {
  return br || (br = 1, (function(t) {
    const r = Ha();
    t.mul = function(a, n) {
      const o = new Uint8Array(a.length + n.length - 1);
      for (let l = 0; l < a.length; l++)
        for (let c = 0; c < n.length; c++)
          o[l + c] ^= r.mul(a[l], n[c]);
      return o;
    }, t.mod = function(a, n) {
      let o = new Uint8Array(a);
      for (; o.length - n.length >= 0; ) {
        const l = o[0];
        for (let d = 0; d < n.length; d++)
          o[d] ^= r.mul(n[d], l);
        let c = 0;
        for (; c < o.length && o[c] === 0; ) c++;
        o = o.slice(c);
      }
      return o;
    }, t.generateECPolynomial = function(a) {
      let n = new Uint8Array([1]);
      for (let o = 0; o < a; o++)
        n = t.mul(n, new Uint8Array([1, r.exp(o)]));
      return n;
    };
  })(wt)), wt;
}
var yt, vr;
function Ya() {
  if (vr) return yt;
  vr = 1;
  const t = Ka();
  function r(s) {
    this.genPoly = void 0, this.degree = s, this.degree && this.initialize(this.degree);
  }
  return r.prototype.initialize = function(a) {
    this.degree = a, this.genPoly = t.generateECPolynomial(this.degree);
  }, r.prototype.encode = function(a) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const n = new Uint8Array(a.length + this.degree);
    n.set(a);
    const o = t.mod(n, this.genPoly), l = this.degree - o.length;
    if (l > 0) {
      const c = new Uint8Array(this.degree);
      return c.set(o, l), c;
    }
    return o;
  }, yt = r, yt;
}
var bt = {}, vt = {}, At = {}, Ar;
function bs() {
  return Ar || (Ar = 1, At.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), At;
}
var ge = {}, Nr;
function vs() {
  if (Nr) return ge;
  Nr = 1;
  const t = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let s = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  s = s.replace(/u/g, "\\u");
  const a = "(?:(?![A-Z0-9 $%*+\\-./:]|" + s + `)(?:.|[\r
]))+`;
  ge.KANJI = new RegExp(s, "g"), ge.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), ge.BYTE = new RegExp(a, "g"), ge.NUMERIC = new RegExp(t, "g"), ge.ALPHANUMERIC = new RegExp(r, "g");
  const n = new RegExp("^" + s + "$"), o = new RegExp("^" + t + "$"), l = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return ge.testKanji = function(d) {
    return n.test(d);
  }, ge.testNumeric = function(d) {
    return o.test(d);
  }, ge.testAlphanumeric = function(d) {
    return l.test(d);
  }, ge;
}
var kr;
function ke() {
  return kr || (kr = 1, (function(t) {
    const r = bs(), s = vs();
    t.NUMERIC = {
      id: "Numeric",
      bit: 1,
      ccBits: [10, 12, 14]
    }, t.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 2,
      ccBits: [9, 11, 13]
    }, t.BYTE = {
      id: "Byte",
      bit: 4,
      ccBits: [8, 16, 16]
    }, t.KANJI = {
      id: "Kanji",
      bit: 8,
      ccBits: [8, 10, 12]
    }, t.MIXED = {
      bit: -1
    }, t.getCharCountIndicator = function(o, l) {
      if (!o.ccBits) throw new Error("Invalid mode: " + o);
      if (!r.isValid(l))
        throw new Error("Invalid version: " + l);
      return l >= 1 && l < 10 ? o.ccBits[0] : l < 27 ? o.ccBits[1] : o.ccBits[2];
    }, t.getBestModeForData = function(o) {
      return s.testNumeric(o) ? t.NUMERIC : s.testAlphanumeric(o) ? t.ALPHANUMERIC : s.testKanji(o) ? t.KANJI : t.BYTE;
    }, t.toString = function(o) {
      if (o && o.id) return o.id;
      throw new Error("Invalid mode");
    }, t.isValid = function(o) {
      return o && o.bit && o.ccBits;
    };
    function a(n) {
      if (typeof n != "string")
        throw new Error("Param is not a string");
      switch (n.toLowerCase()) {
        case "numeric":
          return t.NUMERIC;
        case "alphanumeric":
          return t.ALPHANUMERIC;
        case "kanji":
          return t.KANJI;
        case "byte":
          return t.BYTE;
        default:
          throw new Error("Unknown mode: " + n);
      }
    }
    t.from = function(o, l) {
      if (t.isValid(o))
        return o;
      try {
        return a(o);
      } catch {
        return l;
      }
    };
  })(vt)), vt;
}
var Cr;
function Ga() {
  return Cr || (Cr = 1, (function(t) {
    const r = Ne(), s = ys(), a = $t(), n = ke(), o = bs(), l = 7973, c = r.getBCHDigit(l);
    function d(h, w, m) {
      for (let g = 1; g <= 40; g++)
        if (w <= t.getCapacity(g, m, h))
          return g;
    }
    function u(h, w) {
      return n.getCharCountIndicator(h, w) + 4;
    }
    function p(h, w) {
      let m = 0;
      return h.forEach(function(g) {
        const y = u(g.mode, w);
        m += y + g.getBitsLength();
      }), m;
    }
    function f(h, w) {
      for (let m = 1; m <= 40; m++)
        if (p(h, m) <= t.getCapacity(m, w, n.MIXED))
          return m;
    }
    t.from = function(w, m) {
      return o.isValid(w) ? parseInt(w, 10) : m;
    }, t.getCapacity = function(w, m, g) {
      if (!o.isValid(w))
        throw new Error("Invalid QR Code version");
      typeof g > "u" && (g = n.BYTE);
      const y = r.getSymbolTotalCodewords(w), A = s.getTotalCodewordsCount(w, m), v = (y - A) * 8;
      if (g === n.MIXED) return v;
      const k = v - u(g, w);
      switch (g) {
        case n.NUMERIC:
          return Math.floor(k / 10 * 3);
        case n.ALPHANUMERIC:
          return Math.floor(k / 11 * 2);
        case n.KANJI:
          return Math.floor(k / 13);
        case n.BYTE:
        default:
          return Math.floor(k / 8);
      }
    }, t.getBestVersionForData = function(w, m) {
      let g;
      const y = a.from(m, a.M);
      if (Array.isArray(w)) {
        if (w.length > 1)
          return f(w, y);
        if (w.length === 0)
          return 1;
        g = w[0];
      } else
        g = w;
      return d(g.mode, g.getLength(), y);
    }, t.getEncodedBits = function(w) {
      if (!o.isValid(w) || w < 7)
        throw new Error("Invalid QR Code version");
      let m = w << 12;
      for (; r.getBCHDigit(m) - c >= 0; )
        m ^= l << r.getBCHDigit(m) - c;
      return w << 12 | m;
    };
  })(bt)), bt;
}
var Nt = {}, Er;
function Ja() {
  if (Er) return Nt;
  Er = 1;
  const t = Ne(), r = 1335, s = 21522, a = t.getBCHDigit(r);
  return Nt.getEncodedBits = function(o, l) {
    const c = o.bit << 3 | l;
    let d = c << 10;
    for (; t.getBCHDigit(d) - a >= 0; )
      d ^= r << t.getBCHDigit(d) - a;
    return (c << 10 | d) ^ s;
  }, Nt;
}
var kt = {}, Ct, Sr;
function Xa() {
  if (Sr) return Ct;
  Sr = 1;
  const t = ke();
  function r(s) {
    this.mode = t.NUMERIC, this.data = s.toString();
  }
  return r.getBitsLength = function(a) {
    return 10 * Math.floor(a / 3) + (a % 3 ? a % 3 * 3 + 1 : 0);
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(a) {
    let n, o, l;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      o = this.data.substr(n, 3), l = parseInt(o, 10), a.put(l, 10);
    const c = this.data.length - n;
    c > 0 && (o = this.data.substr(n), l = parseInt(o, 10), a.put(l, c * 3 + 1));
  }, Ct = r, Ct;
}
var Et, Pr;
function Za() {
  if (Pr) return Et;
  Pr = 1;
  const t = ke(), r = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    " ",
    "$",
    "%",
    "*",
    "+",
    "-",
    ".",
    "/",
    ":"
  ];
  function s(a) {
    this.mode = t.ALPHANUMERIC, this.data = a;
  }
  return s.getBitsLength = function(n) {
    return 11 * Math.floor(n / 2) + 6 * (n % 2);
  }, s.prototype.getLength = function() {
    return this.data.length;
  }, s.prototype.getBitsLength = function() {
    return s.getBitsLength(this.data.length);
  }, s.prototype.write = function(n) {
    let o;
    for (o = 0; o + 2 <= this.data.length; o += 2) {
      let l = r.indexOf(this.data[o]) * 45;
      l += r.indexOf(this.data[o + 1]), n.put(l, 11);
    }
    this.data.length % 2 && n.put(r.indexOf(this.data[o]), 6);
  }, Et = s, Et;
}
var St, xr;
function ei() {
  if (xr) return St;
  xr = 1;
  const t = ke();
  function r(s) {
    this.mode = t.BYTE, typeof s == "string" ? this.data = new TextEncoder().encode(s) : this.data = new Uint8Array(s);
  }
  return r.getBitsLength = function(a) {
    return a * 8;
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(s) {
    for (let a = 0, n = this.data.length; a < n; a++)
      s.put(this.data[a], 8);
  }, St = r, St;
}
var Pt, Lr;
function ti() {
  if (Lr) return Pt;
  Lr = 1;
  const t = ke(), r = Ne();
  function s(a) {
    this.mode = t.KANJI, this.data = a;
  }
  return s.getBitsLength = function(n) {
    return n * 13;
  }, s.prototype.getLength = function() {
    return this.data.length;
  }, s.prototype.getBitsLength = function() {
    return s.getBitsLength(this.data.length);
  }, s.prototype.write = function(a) {
    let n;
    for (n = 0; n < this.data.length; n++) {
      let o = r.toSJIS(this.data[n]);
      if (o >= 33088 && o <= 40956)
        o -= 33088;
      else if (o >= 57408 && o <= 60351)
        o -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[n] + `
Make sure your charset is UTF-8`
        );
      o = (o >>> 8 & 255) * 192 + (o & 255), a.put(o, 13);
    }
  }, Pt = s, Pt;
}
var xt = { exports: {} }, Tr;
function ri() {
  return Tr || (Tr = 1, (function(t) {
    var r = {
      single_source_shortest_paths: function(s, a, n) {
        var o = {}, l = {};
        l[a] = 0;
        var c = r.PriorityQueue.make();
        c.push(a, 0);
        for (var d, u, p, f, h, w, m, g, y; !c.empty(); ) {
          d = c.pop(), u = d.value, f = d.cost, h = s[u] || {};
          for (p in h)
            h.hasOwnProperty(p) && (w = h[p], m = f + w, g = l[p], y = typeof l[p] > "u", (y || g > m) && (l[p] = m, c.push(p, m), o[p] = u));
        }
        if (typeof n < "u" && typeof l[n] > "u") {
          var A = ["Could not find a path from ", a, " to ", n, "."].join("");
          throw new Error(A);
        }
        return o;
      },
      extract_shortest_path_from_predecessor_list: function(s, a) {
        for (var n = [], o = a; o; )
          n.push(o), s[o], o = s[o];
        return n.reverse(), n;
      },
      find_path: function(s, a, n) {
        var o = r.single_source_shortest_paths(s, a, n);
        return r.extract_shortest_path_from_predecessor_list(
          o,
          n
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(s) {
          var a = r.PriorityQueue, n = {}, o;
          s = s || {};
          for (o in a)
            a.hasOwnProperty(o) && (n[o] = a[o]);
          return n.queue = [], n.sorter = s.sorter || a.default_sorter, n;
        },
        default_sorter: function(s, a) {
          return s.cost - a.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(s, a) {
          var n = { value: s, cost: a };
          this.queue.push(n), this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    t.exports = r;
  })(xt)), xt.exports;
}
var Dr;
function si() {
  return Dr || (Dr = 1, (function(t) {
    const r = ke(), s = Xa(), a = Za(), n = ei(), o = ti(), l = vs(), c = Ne(), d = ri();
    function u(A) {
      return unescape(encodeURIComponent(A)).length;
    }
    function p(A, v, k) {
      const P = [];
      let S;
      for (; (S = A.exec(k)) !== null; )
        P.push({
          data: S[0],
          index: S.index,
          mode: v,
          length: S[0].length
        });
      return P;
    }
    function f(A) {
      const v = p(l.NUMERIC, r.NUMERIC, A), k = p(l.ALPHANUMERIC, r.ALPHANUMERIC, A);
      let P, S;
      return c.isKanjiModeEnabled() ? (P = p(l.BYTE, r.BYTE, A), S = p(l.KANJI, r.KANJI, A)) : (P = p(l.BYTE_KANJI, r.BYTE, A), S = []), v.concat(k, P, S).sort(function(x, M) {
        return x.index - M.index;
      }).map(function(x) {
        return {
          data: x.data,
          mode: x.mode,
          length: x.length
        };
      });
    }
    function h(A, v) {
      switch (v) {
        case r.NUMERIC:
          return s.getBitsLength(A);
        case r.ALPHANUMERIC:
          return a.getBitsLength(A);
        case r.KANJI:
          return o.getBitsLength(A);
        case r.BYTE:
          return n.getBitsLength(A);
      }
    }
    function w(A) {
      return A.reduce(function(v, k) {
        const P = v.length - 1 >= 0 ? v[v.length - 1] : null;
        return P && P.mode === k.mode ? (v[v.length - 1].data += k.data, v) : (v.push(k), v);
      }, []);
    }
    function m(A) {
      const v = [];
      for (let k = 0; k < A.length; k++) {
        const P = A[k];
        switch (P.mode) {
          case r.NUMERIC:
            v.push([
              P,
              { data: P.data, mode: r.ALPHANUMERIC, length: P.length },
              { data: P.data, mode: r.BYTE, length: P.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            v.push([
              P,
              { data: P.data, mode: r.BYTE, length: P.length }
            ]);
            break;
          case r.KANJI:
            v.push([
              P,
              { data: P.data, mode: r.BYTE, length: u(P.data) }
            ]);
            break;
          case r.BYTE:
            v.push([
              { data: P.data, mode: r.BYTE, length: u(P.data) }
            ]);
        }
      }
      return v;
    }
    function g(A, v) {
      const k = {}, P = { start: {} };
      let S = ["start"];
      for (let b = 0; b < A.length; b++) {
        const x = A[b], M = [];
        for (let E = 0; E < x.length; E++) {
          const D = x[E], L = "" + b + E;
          M.push(L), k[L] = { node: D, lastCount: 0 }, P[L] = {};
          for (let T = 0; T < S.length; T++) {
            const R = S[T];
            k[R] && k[R].node.mode === D.mode ? (P[R][L] = h(k[R].lastCount + D.length, D.mode) - h(k[R].lastCount, D.mode), k[R].lastCount += D.length) : (k[R] && (k[R].lastCount = D.length), P[R][L] = h(D.length, D.mode) + 4 + r.getCharCountIndicator(D.mode, v));
          }
        }
        S = M;
      }
      for (let b = 0; b < S.length; b++)
        P[S[b]].end = 0;
      return { map: P, table: k };
    }
    function y(A, v) {
      let k;
      const P = r.getBestModeForData(A);
      if (k = r.from(v, P), k !== r.BYTE && k.bit < P.bit)
        throw new Error('"' + A + '" cannot be encoded with mode ' + r.toString(k) + `.
 Suggested mode is: ` + r.toString(P));
      switch (k === r.KANJI && !c.isKanjiModeEnabled() && (k = r.BYTE), k) {
        case r.NUMERIC:
          return new s(A);
        case r.ALPHANUMERIC:
          return new a(A);
        case r.KANJI:
          return new o(A);
        case r.BYTE:
          return new n(A);
      }
    }
    t.fromArray = function(v) {
      return v.reduce(function(k, P) {
        return typeof P == "string" ? k.push(y(P, null)) : P.data && k.push(y(P.data, P.mode)), k;
      }, []);
    }, t.fromString = function(v, k) {
      const P = f(v, c.isKanjiModeEnabled()), S = m(P), b = g(S, k), x = d.find_path(b.map, "start", "end"), M = [];
      for (let E = 1; E < x.length - 1; E++)
        M.push(b.table[x[E]].node);
      return t.fromArray(w(M));
    }, t.rawSplit = function(v) {
      return t.fromArray(
        f(v, c.isKanjiModeEnabled())
      );
    };
  })(kt)), kt;
}
var Mr;
function ni() {
  if (Mr) return dt;
  Mr = 1;
  const t = Ne(), r = $t(), s = ja(), a = $a(), n = za(), o = Va(), l = Qa(), c = ys(), d = Ya(), u = Ga(), p = Ja(), f = ke(), h = si();
  function w(b, x) {
    const M = b.size, E = o.getPositions(x);
    for (let D = 0; D < E.length; D++) {
      const L = E[D][0], T = E[D][1];
      for (let R = -1; R <= 7; R++)
        if (!(L + R <= -1 || M <= L + R))
          for (let F = -1; F <= 7; F++)
            T + F <= -1 || M <= T + F || (R >= 0 && R <= 6 && (F === 0 || F === 6) || F >= 0 && F <= 6 && (R === 0 || R === 6) || R >= 2 && R <= 4 && F >= 2 && F <= 4 ? b.set(L + R, T + F, !0, !0) : b.set(L + R, T + F, !1, !0));
    }
  }
  function m(b) {
    const x = b.size;
    for (let M = 8; M < x - 8; M++) {
      const E = M % 2 === 0;
      b.set(M, 6, E, !0), b.set(6, M, E, !0);
    }
  }
  function g(b, x) {
    const M = n.getPositions(x);
    for (let E = 0; E < M.length; E++) {
      const D = M[E][0], L = M[E][1];
      for (let T = -2; T <= 2; T++)
        for (let R = -2; R <= 2; R++)
          T === -2 || T === 2 || R === -2 || R === 2 || T === 0 && R === 0 ? b.set(D + T, L + R, !0, !0) : b.set(D + T, L + R, !1, !0);
    }
  }
  function y(b, x) {
    const M = b.size, E = u.getEncodedBits(x);
    let D, L, T;
    for (let R = 0; R < 18; R++)
      D = Math.floor(R / 3), L = R % 3 + M - 8 - 3, T = (E >> R & 1) === 1, b.set(D, L, T, !0), b.set(L, D, T, !0);
  }
  function A(b, x, M) {
    const E = b.size, D = p.getEncodedBits(x, M);
    let L, T;
    for (L = 0; L < 15; L++)
      T = (D >> L & 1) === 1, L < 6 ? b.set(L, 8, T, !0) : L < 8 ? b.set(L + 1, 8, T, !0) : b.set(E - 15 + L, 8, T, !0), L < 8 ? b.set(8, E - L - 1, T, !0) : L < 9 ? b.set(8, 15 - L - 1 + 1, T, !0) : b.set(8, 15 - L - 1, T, !0);
    b.set(E - 8, 8, 1, !0);
  }
  function v(b, x) {
    const M = b.size;
    let E = -1, D = M - 1, L = 7, T = 0;
    for (let R = M - 1; R > 0; R -= 2)
      for (R === 6 && R--; ; ) {
        for (let F = 0; F < 2; F++)
          if (!b.isReserved(D, R - F)) {
            let _ = !1;
            T < x.length && (_ = (x[T] >>> L & 1) === 1), b.set(D, R - F, _), L--, L === -1 && (T++, L = 7);
          }
        if (D += E, D < 0 || M <= D) {
          D -= E, E = -E;
          break;
        }
      }
  }
  function k(b, x, M) {
    const E = new s();
    M.forEach(function(F) {
      E.put(F.mode.bit, 4), E.put(F.getLength(), f.getCharCountIndicator(F.mode, b)), F.write(E);
    });
    const D = t.getSymbolTotalCodewords(b), L = c.getTotalCodewordsCount(b, x), T = (D - L) * 8;
    for (E.getLengthInBits() + 4 <= T && E.put(0, 4); E.getLengthInBits() % 8 !== 0; )
      E.putBit(0);
    const R = (T - E.getLengthInBits()) / 8;
    for (let F = 0; F < R; F++)
      E.put(F % 2 ? 17 : 236, 8);
    return P(E, b, x);
  }
  function P(b, x, M) {
    const E = t.getSymbolTotalCodewords(x), D = c.getTotalCodewordsCount(x, M), L = E - D, T = c.getBlocksCount(x, M), R = E % T, F = T - R, _ = Math.floor(E / T), U = Math.floor(L / T), J = U + 1, K = _ - U, B = new d(K);
    let q = 0;
    const O = new Array(T), H = new Array(T);
    let pe = 0;
    const oe = new Uint8Array(b.buffer);
    for (let Z = 0; Z < T; Z++) {
      const ce = Z < F ? U : J;
      O[Z] = oe.slice(q, q + ce), H[Z] = B.encode(O[Z]), q += ce, pe = Math.max(pe, ce);
    }
    const fe = new Uint8Array(E);
    let de = 0, V, z;
    for (V = 0; V < pe; V++)
      for (z = 0; z < T; z++)
        V < O[z].length && (fe[de++] = O[z][V]);
    for (V = 0; V < K; V++)
      for (z = 0; z < T; z++)
        fe[de++] = H[z][V];
    return fe;
  }
  function S(b, x, M, E) {
    let D;
    if (Array.isArray(b))
      D = h.fromArray(b);
    else if (typeof b == "string") {
      let _ = x;
      if (!_) {
        const U = h.rawSplit(b);
        _ = u.getBestVersionForData(U, M);
      }
      D = h.fromString(b, _ || 40);
    } else
      throw new Error("Invalid data");
    const L = u.getBestVersionForData(D, M);
    if (!L)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!x)
      x = L;
    else if (x < L)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + L + `.
`
      );
    const T = k(x, M, D), R = t.getSymbolSize(x), F = new a(R);
    return w(F, x), m(F), g(F, x), A(F, M, 0), x >= 7 && y(F, x), v(F, T), isNaN(E) && (E = l.getBestMask(
      F,
      A.bind(null, F, M)
    )), l.applyMask(E, F), A(F, M, E), {
      modules: F,
      version: x,
      errorCorrectionLevel: M,
      maskPattern: E,
      segments: D
    };
  }
  return dt.create = function(x, M) {
    if (typeof x > "u" || x === "")
      throw new Error("No input text");
    let E = r.M, D, L;
    return typeof M < "u" && (E = r.from(M.errorCorrectionLevel, r.M), D = u.from(M.version), L = l.from(M.maskPattern), M.toSJISFunc && t.setToSJISFunction(M.toSJISFunc)), S(x, D, E, L);
  }, dt;
}
var Lt = {}, Tt = {}, Rr;
function As() {
  return Rr || (Rr = 1, (function(t) {
    function r(s) {
      if (typeof s == "number" && (s = s.toString()), typeof s != "string")
        throw new Error("Color should be defined as hex string");
      let a = s.slice().replace("#", "").split("");
      if (a.length < 3 || a.length === 5 || a.length > 8)
        throw new Error("Invalid hex color: " + s);
      (a.length === 3 || a.length === 4) && (a = Array.prototype.concat.apply([], a.map(function(o) {
        return [o, o];
      }))), a.length === 6 && a.push("F", "F");
      const n = parseInt(a.join(""), 16);
      return {
        r: n >> 24 & 255,
        g: n >> 16 & 255,
        b: n >> 8 & 255,
        a: n & 255,
        hex: "#" + a.slice(0, 6).join("")
      };
    }
    t.getOptions = function(a) {
      a || (a = {}), a.color || (a.color = {});
      const n = typeof a.margin > "u" || a.margin === null || a.margin < 0 ? 4 : a.margin, o = a.width && a.width >= 21 ? a.width : void 0, l = a.scale || 4;
      return {
        width: o,
        scale: o ? 4 : l,
        margin: n,
        color: {
          dark: r(a.color.dark || "#000000ff"),
          light: r(a.color.light || "#ffffffff")
        },
        type: a.type,
        rendererOpts: a.rendererOpts || {}
      };
    }, t.getScale = function(a, n) {
      return n.width && n.width >= a + n.margin * 2 ? n.width / (a + n.margin * 2) : n.scale;
    }, t.getImageWidth = function(a, n) {
      const o = t.getScale(a, n);
      return Math.floor((a + n.margin * 2) * o);
    }, t.qrToImageData = function(a, n, o) {
      const l = n.modules.size, c = n.modules.data, d = t.getScale(l, o), u = Math.floor((l + o.margin * 2) * d), p = o.margin * d, f = [o.color.light, o.color.dark];
      for (let h = 0; h < u; h++)
        for (let w = 0; w < u; w++) {
          let m = (h * u + w) * 4, g = o.color.light;
          if (h >= p && w >= p && h < u - p && w < u - p) {
            const y = Math.floor((h - p) / d), A = Math.floor((w - p) / d);
            g = f[c[y * l + A] ? 1 : 0];
          }
          a[m++] = g.r, a[m++] = g.g, a[m++] = g.b, a[m] = g.a;
        }
    };
  })(Tt)), Tt;
}
var Br;
function oi() {
  return Br || (Br = 1, (function(t) {
    const r = As();
    function s(n, o, l) {
      n.clearRect(0, 0, o.width, o.height), o.style || (o.style = {}), o.height = l, o.width = l, o.style.height = l + "px", o.style.width = l + "px";
    }
    function a() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    t.render = function(o, l, c) {
      let d = c, u = l;
      typeof d > "u" && (!l || !l.getContext) && (d = l, l = void 0), l || (u = a()), d = r.getOptions(d);
      const p = r.getImageWidth(o.modules.size, d), f = u.getContext("2d"), h = f.createImageData(p, p);
      return r.qrToImageData(h.data, o, d), s(f, u, p), f.putImageData(h, 0, 0), u;
    }, t.renderToDataURL = function(o, l, c) {
      let d = c;
      typeof d > "u" && (!l || !l.getContext) && (d = l, l = void 0), d || (d = {});
      const u = t.render(o, l, d), p = d.type || "image/png", f = d.rendererOpts || {};
      return u.toDataURL(p, f.quality);
    };
  })(Lt)), Lt;
}
var Dt = {}, Ur;
function ai() {
  if (Ur) return Dt;
  Ur = 1;
  const t = As();
  function r(n, o) {
    const l = n.a / 255, c = o + '="' + n.hex + '"';
    return l < 1 ? c + " " + o + '-opacity="' + l.toFixed(2).slice(1) + '"' : c;
  }
  function s(n, o, l) {
    let c = n + o;
    return typeof l < "u" && (c += " " + l), c;
  }
  function a(n, o, l) {
    let c = "", d = 0, u = !1, p = 0;
    for (let f = 0; f < n.length; f++) {
      const h = Math.floor(f % o), w = Math.floor(f / o);
      !h && !u && (u = !0), n[f] ? (p++, f > 0 && h > 0 && n[f - 1] || (c += u ? s("M", h + l, 0.5 + w + l) : s("m", d, 0), d = 0, u = !1), h + 1 < o && n[f + 1] || (c += s("h", p), p = 0)) : d++;
    }
    return c;
  }
  return Dt.render = function(o, l, c) {
    const d = t.getOptions(l), u = o.modules.size, p = o.modules.data, f = u + d.margin * 2, h = d.color.light.a ? "<path " + r(d.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", w = "<path " + r(d.color.dark, "stroke") + ' d="' + a(p, u, d.margin) + '"/>', m = 'viewBox="0 0 ' + f + " " + f + '"', y = '<svg xmlns="http://www.w3.org/2000/svg" ' + (d.width ? 'width="' + d.width + '" height="' + d.width + '" ' : "") + m + ' shape-rendering="crispEdges">' + h + w + `</svg>
`;
    return typeof c == "function" && c(null, y), y;
  }, Dt;
}
var Ir;
function ii() {
  if (Ir) return Ee;
  Ir = 1;
  const t = _a(), r = ni(), s = oi(), a = ai();
  function n(o, l, c, d, u) {
    const p = [].slice.call(arguments, 1), f = p.length, h = typeof p[f - 1] == "function";
    if (!h && !t())
      throw new Error("Callback required as last argument");
    if (h) {
      if (f < 2)
        throw new Error("Too few arguments provided");
      f === 2 ? (u = c, c = l, l = d = void 0) : f === 3 && (l.getContext && typeof u > "u" ? (u = d, d = void 0) : (u = d, d = c, c = l, l = void 0));
    } else {
      if (f < 1)
        throw new Error("Too few arguments provided");
      return f === 1 ? (c = l, l = d = void 0) : f === 2 && !l.getContext && (d = c, c = l, l = void 0), new Promise(function(w, m) {
        try {
          const g = r.create(c, d);
          w(o(g, l, d));
        } catch (g) {
          m(g);
        }
      });
    }
    try {
      const w = r.create(c, d);
      u(null, o(w, l, d));
    } catch (w) {
      u(w);
    }
  }
  return Ee.create = r.create, Ee.toCanvas = n.bind(null, s.render), Ee.toDataURL = n.bind(null, s.renderToDataURL), Ee.toString = n.bind(null, function(o, l, c) {
    return a.render(o, c);
  }), Ee;
}
var ci = ii();
const li = /* @__PURE__ */ sn(ci);
function di({ value: t, size: r = 200, alt: s = "QR code", className: a = "" }) {
  const n = Q(null), [o, l] = N(null);
  return I(() => {
    !n.current || !t || li.toCanvas(n.current, t, {
      width: r,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      l(null);
    }).catch((c) => {
      l(c instanceof Error ? c.message : "Failed to generate QR code");
    });
  }, [t, r]), o ? /* @__PURE__ */ e(
    "div",
    {
      className: `cedros-qr-error ${a}`,
      style: { width: r, height: r },
      role: "img",
      "aria-label": s,
      children: /* @__PURE__ */ e("p", { children: "Failed to generate QR code" })
    }
  ) : /* @__PURE__ */ e(
    "canvas",
    {
      ref: n,
      className: `cedros-totp-qr-image ${a}`,
      role: "img",
      "aria-label": s,
      style: { borderRadius: "0.5rem" }
    }
  );
}
function Ns() {
  const { config: t, _internal: r } = se(), [s, a] = N(null), [n, o] = N("idle"), [l, c] = N(null), [d, u] = N(!1), [p, f] = N(null), h = $(
    () => new ie({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), w = C(async () => {
    u(!0), f(null);
    try {
      const P = await h.get("/mfa/status");
      return a(P), P;
    } catch (P) {
      const S = W(P, "Failed to get TOTP status");
      throw f(S), S;
    } finally {
      u(!1);
    }
  }, [h]), m = C(async () => {
    u(!0), f(null), o("loading");
    try {
      const P = await h.post("/mfa/setup", {});
      return c(P), o("setup"), P;
    } catch (P) {
      const S = W(P, "Failed to start TOTP setup");
      throw f(S), o("error"), S;
    } finally {
      u(!1);
    }
  }, [h]), g = C(
    async (P) => {
      if (!/^\d{6}$/.test(P)) {
        const S = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(S), S;
      }
      u(!0), f(null), o("verifying");
      try {
        await h.post("/mfa/enable", { code: P }), o("success"), a({ enabled: !0, recoveryCodesRemaining: l?.recoveryCodes.length ?? 0 });
      } catch (S) {
        const b = W(S, "Invalid verification code");
        throw f(b), o("error"), b;
      } finally {
        u(!1);
      }
    },
    [h, l]
  ), y = C(
    async (P) => {
      if (!P) {
        const S = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw f(S), S;
      }
      u(!0), f(null);
      try {
        await h.post("/mfa/disable", { password: P }), a({ enabled: !1, recoveryCodesRemaining: 0 }), c(null), o("idle");
      } catch (S) {
        const b = W(S, "Failed to disable TOTP");
        throw f(b), b;
      } finally {
        u(!1);
      }
    },
    [h]
  ), A = C(
    async (P) => {
      if (!/^\d{6}$/.test(P)) {
        const S = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(S), S;
      }
      u(!0), f(null);
      try {
        return await h.post(
          "/mfa/recovery-codes/regenerate",
          { code: P }
        );
      } catch (S) {
        const b = W(S, "Failed to regenerate recovery codes");
        throw f(b), b;
      } finally {
        u(!1);
      }
    },
    [h]
  ), v = C(() => f(null), []), k = C(() => {
    f(null), c(null), o("idle"), u(!1);
  }, []);
  return {
    status: s,
    setupState: n,
    setupData: l,
    isLoading: d,
    error: p,
    getStatus: w,
    beginSetup: m,
    enableTotp: g,
    disableTotp: y,
    regenerateBackupCodes: A,
    clearError: v,
    reset: k
  };
}
function ui({ onSuccess: t, onCancel: r, className: s = "" }) {
  const { setupState: a, setupData: n, isLoading: o, error: l, beginSetup: c, enableTotp: d, clearError: u, reset: p } = Ns(), [f, h] = N("qr"), [w, m] = N(""), [g, y] = N(!1), [A, v] = N(!1), k = Q(null);
  I(() => {
    a === "idle" && c().catch(() => {
    });
  }, [a, c]), I(() => {
    a === "success" && t?.();
  }, [a, t]);
  const P = async () => {
    n?.secret && (await navigator.clipboard.writeText(n.secret), y(!0), k.current !== null && window.clearTimeout(k.current), k.current = window.setTimeout(() => y(!1), 2e3));
  }, S = async () => {
    if (n?.recoveryCodes) {
      const M = n.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(M);
    }
  }, b = async () => {
    try {
      await d(w);
    } catch {
      m("");
    }
  }, x = () => {
    p(), r?.();
  };
  return I(() => () => {
    k.current !== null && (window.clearTimeout(k.current), k.current = null);
  }, []), a === "loading" || a === "idle" && o ? /* @__PURE__ */ e("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(ee, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : a === "error" && !n ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${s}`, children: [
    /* @__PURE__ */ e(ae, { error: l, onDismiss: u }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: x,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: () => c(),
          children: "Try again"
        }
      )
    ] })
  ] }) : a === "success" ? /* @__PURE__ */ e("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-success", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-totp-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ e("circle", { cx: "24", cy: "24", r: "22", stroke: "var(--cedros-success)", strokeWidth: "2" }),
          /* @__PURE__ */ e(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "var(--cedros-success)",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Two-factor authentication enabled" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Your account is now protected with an additional layer of security." })
  ] }) }) : n ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${s}`, children: [
    f === "qr" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ e("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ e(di, { value: n.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ e("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ i("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ e("code", { className: "cedros-totp-secret-code", children: n.secret }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: P,
              "aria-label": "Copy secret",
              children: g ? "Copied!" : "Copy"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: x,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => h("backup"),
            children: "Continue"
          }
        )
      ] })
    ] }),
    f === "backup" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: n.recoveryCodes.map((M, E) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: M }, E)) }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: S,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ i("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: A,
            onChange: (M) => v(M.target.checked)
          }
        ),
        /* @__PURE__ */ e("span", { className: "cedros-checkbox-text", children: "I have saved these recovery codes" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => h("qr"),
            children: "Back"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => h("verify"),
            disabled: !A,
            children: "Continue"
          }
        )
      ] })
    ] }),
    f === "verify" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ e(
        Xr,
        {
          value: w,
          onChange: m,
          onComplete: b,
          disabled: o,
          error: l?.message,
          autoFocus: !0
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => h("backup"),
            disabled: o,
            children: "Back"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: b,
            disabled: o || w.length !== 6,
            children: o ? /* @__PURE__ */ i(te, { children: [
              /* @__PURE__ */ e(ee, { size: "sm" }),
              /* @__PURE__ */ e("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function lc({ onStatusChange: t, className: r = "" }) {
  const { status: s, isLoading: a, error: n, getStatus: o, disableTotp: l, regenerateBackupCodes: c, clearError: d } = Ns(), [u, p] = N("status"), [f, h] = N(""), [w, m] = N(""), [g, y] = N(null), [A, v] = N(!1), [k, P] = N(null);
  I(() => {
    o().catch(() => {
    });
  }, [o]);
  const S = C(() => {
    p("status"), t?.(!0);
  }, [t]), b = async () => {
    v(!0), P(null);
    try {
      await l(f), p("status"), h(""), t?.(!1);
    } catch (E) {
      P(E instanceof Error ? E.message : "Failed to disable 2FA"), h("");
    } finally {
      v(!1);
    }
  }, x = async () => {
    v(!0), P(null);
    try {
      const E = await c(w);
      y(E.recoveryCodes), m("");
    } catch (E) {
      P(E instanceof Error ? E.message : "Failed to regenerate codes"), m("");
    } finally {
      v(!1);
    }
  }, M = async () => {
    g && await navigator.clipboard.writeText(g.join(`
`));
  };
  return a && !s ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(ee, { size: "md", label: "Loading security settings" }) }) }) : n && !s ? /* @__PURE__ */ i("div", { className: `cedros-totp-settings ${r}`, children: [
    /* @__PURE__ */ e(ae, { error: n, onDismiss: d }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => o(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e(ui, { onSuccess: S, onCancel: () => p("status") }) }) : u === "disable" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    k && /* @__PURE__ */ e("div", { className: "cedros-totp-error", children: /* @__PURE__ */ e(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: k },
        onDismiss: () => P(null)
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ e(
      xe,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: f,
        onChange: (E) => h(E.target.value),
        disabled: A,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => {
            p("status"), h(""), P(null);
          },
          disabled: A,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: b,
          disabled: A || f.length === 0,
          children: A ? /* @__PURE__ */ i(te, { children: [
            /* @__PURE__ */ e(ee, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? g ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: g.map((E, D) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: E }, D)) }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: M,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ e("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          p("status"), y(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    k && /* @__PURE__ */ e("div", { className: "cedros-totp-error", children: /* @__PURE__ */ e(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: k },
        onDismiss: () => P(null)
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ e(
      Xr,
      {
        value: w,
        onChange: m,
        onComplete: x,
        disabled: A,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => {
            p("status"), m(""), P(null);
          },
          disabled: A,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: x,
          disabled: A || w.length !== 6,
          children: A ? /* @__PURE__ */ i(te, { children: [
            /* @__PURE__ */ e(ee, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Regenerating..." })
          ] }) : "Regenerate codes"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-totp-status-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-totp-status-info", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
        /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Add an extra layer of security to your account by requiring a verification code from your authenticator app when signing in." })
      ] }),
      /* @__PURE__ */ e(
        "div",
        {
          className: `cedros-totp-badge ${s?.enabled ? "cedros-totp-badge-enabled" : "cedros-totp-badge-disabled"}`,
          children: s?.enabled ? "Enabled" : "Disabled"
        }
      )
    ] }),
    s?.enabled ? /* @__PURE__ */ i("div", { className: "cedros-totp-enabled-actions", children: [
      /* @__PURE__ */ i("div", { className: "cedros-totp-description", style: { marginTop: "0.25rem" }, children: [
        "Recovery codes remaining: ",
        /* @__PURE__ */ e("strong", { children: s.recoveryCodesRemaining })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => p("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => p("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => p("setup"),
        children: "Enable two-factor authentication"
      }
    )
  ] }) });
}
function hi() {
  const t = Le(), [r, s] = N(!1), [a, n] = N(null), o = $(() => t ? new ie({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = C(() => {
    n(null);
  }, []), c = C(
    async (m) => {
      if (!o)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await o.post("/deposit", {
          amount_lamports: m
        });
      } catch (g) {
        const y = W(g, "Failed to execute deposit");
        throw n(y.message), y;
      } finally {
        s(!1);
      }
    },
    [o]
  ), d = C(
    async (m) => {
      if (!o)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await o.get(`/deposit/status/${m}`);
      } catch (g) {
        const y = W(g, "Failed to get deposit status");
        throw n(y.message), y;
      } finally {
        s(!1);
      }
    },
    [o]
  ), u = C(async () => {
    if (!o)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await o.get("/deposit/config");
    } catch (m) {
      const g = W(m, "Failed to get deposit config");
      throw n(g.message), g;
    } finally {
      s(!1);
    }
  }, [o]), p = C(
    async (m) => {
      if (!o)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = new URLSearchParams();
        m?.limit !== void 0 && g.set("limit", String(m.limit)), m?.offset !== void 0 && g.set("offset", String(m.offset));
        const y = g.toString(), A = y ? `/deposits?${y}` : "/deposits";
        return await o.get(A);
      } catch (g) {
        const y = W(g, "Failed to list deposits");
        throw n(y.message), y;
      } finally {
        s(!1);
      }
    },
    [o]
  ), f = C(
    async (m) => {
      if (!o)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = new URLSearchParams({
          input_mint: m.inputMint,
          amount: String(m.amount),
          taker: m.taker
        });
        return await o.get(`/deposit/quote?${g}`);
      } catch (g) {
        const y = W(g, "Failed to get deposit quote");
        throw n(y.message), y;
      } finally {
        s(!1);
      }
    },
    [o]
  ), h = C(
    async (m) => {
      if (!o)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await o.post("/deposit/public", m);
      } catch (g) {
        const y = W(g, "Failed to execute public deposit");
        throw n(y.message), y;
      } finally {
        s(!1);
      }
    },
    [o]
  ), w = C(
    async (m) => {
      if (!o)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await o.post("/deposit/micro", m);
      } catch (g) {
        const y = W(g, "Failed to execute micro deposit");
        throw n(y.message), y;
      } finally {
        s(!1);
      }
    },
    [o]
  );
  return {
    deposit: c,
    getQuote: f,
    publicDeposit: h,
    microDeposit: w,
    getStatus: d,
    getConfig: u,
    listDeposits: p,
    isLoading: r,
    error: a,
    clearError: l
  };
}
function ks({
  tokens: t,
  selectedToken: r,
  onSelect: s,
  openSignal: a,
  placeholder: n = "Select token",
  disabled: o = !1,
  className: l = "",
  searchable: c = !0
}) {
  const [d, u] = N(!1), [p, f] = N(""), h = Q(null), w = Q(null), m = $(() => {
    if (!p.trim()) return t;
    const v = p.toLowerCase();
    return t.filter(
      (k) => k.symbol.toLowerCase().includes(v) || k.name.toLowerCase().includes(v) || k.mint.toLowerCase().includes(v)
    );
  }, [t, p]);
  I(() => {
    const v = (k) => {
      h.current && !h.current.contains(k.target) && (u(!1), f(""));
    };
    if (d)
      return document.addEventListener("mousedown", v), () => document.removeEventListener("mousedown", v);
  }, [d]), I(() => {
    d && c && w.current && w.current.focus();
  }, [d, c]), I(() => {
    a === void 0 || o || (u(!0), f(""));
  }, [a, o]);
  const g = C(() => {
    o || (u((v) => !v), d && f(""));
  }, [o, d]), y = C(
    (v) => {
      s(v), u(!1), f("");
    },
    [s]
  ), A = C(
    (v) => {
      v.key === "Escape" ? (u(!1), f("")) : v.key === "Enter" && m.length === 1 && y(m[0]);
    },
    [m, y]
  );
  return /* @__PURE__ */ i(
    "div",
    {
      ref: h,
      className: `cedros-token-selector ${d ? "cedros-token-selector-open" : ""} ${o ? "cedros-token-selector-disabled" : ""} ${l}`,
      onKeyDown: A,
      children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: g,
            disabled: o,
            "aria-haspopup": "listbox",
            "aria-expanded": d,
            children: [
              r ? /* @__PURE__ */ i("span", { className: "cedros-token-selector-selected", children: [
                r.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    src: r.logoUrl,
                    alt: r.symbol,
                    className: "cedros-token-icon",
                    onError: (v) => {
                      v.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ e("span", { className: "cedros-token-symbol", children: r.symbol })
              ] }) : /* @__PURE__ */ e("span", { className: "cedros-token-selector-placeholder", children: n }),
              /* @__PURE__ */ e("span", { className: "cedros-token-selector-arrow", children: d ? "▲" : "▼" })
            ]
          }
        ),
        d && /* @__PURE__ */ i("div", { className: "cedros-token-selector-dropdown", role: "listbox", children: [
          c && /* @__PURE__ */ e("div", { className: "cedros-token-search", children: /* @__PURE__ */ e(
            "input",
            {
              ref: w,
              type: "text",
              value: p,
              onChange: (v) => f(v.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-token-list", children: m.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ e(te, { children: m.map((v) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${r?.mint === v.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => y(v),
              role: "option",
              "aria-selected": r?.mint === v.mint,
              children: [
                v.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    src: v.logoUrl,
                    alt: v.symbol,
                    className: "cedros-token-icon",
                    onError: (k) => {
                      k.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ i("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-token-symbol", children: v.symbol }),
                  /* @__PURE__ */ e("span", { className: "cedros-token-name", children: v.name })
                ] }),
                r?.mint === v.mint && /* @__PURE__ */ e("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            v.mint
          )) }) })
        ] })
      ]
    }
  );
}
function zt(t, r) {
  return r.privateDepositsEnabled && t >= r.privateMinUsd ? "private" : t >= r.publicMinUsd ? "public" : "sol_micro";
}
const Vt = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", mi = 1e4, et = 1e3, Cs = 3;
function pi(t) {
  return Number.isFinite(t) ? `$${Math.round(t)}` : "$0";
}
function fi(t, r) {
  switch (t) {
    case "private":
      return {
        label: "Private",
        detail: "Private transaction, instant credit",
        note: null
      };
    case "public":
      return {
        label: "Public",
        detail: "Visible on-chain, instant credit",
        note: null
      };
    case "sol_micro":
      return {
        label: "SOL Only",
        detail: `SOL only under ${pi(r.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function Qt(t, r, s) {
  return Math.min(Math.max(t, r), s);
}
function gi(t, r) {
  if (r <= 0) return 0;
  const s = Qt(t / r, 0, 1);
  return Math.round(Math.pow(s, 1 / Cs) * et);
}
function wi(t, r) {
  const s = Qt(t / et, 0, 1);
  return r * Math.pow(s, Cs);
}
function Es(t) {
  return t < 10 ? 0.01 : t < 100 ? 1 : t < 500 ? 5 : t < 1e3 ? 10 : t < 5e3 ? 25 : 50;
}
function yi(t) {
  return t < 1 ? 2 : 0;
}
function Fr(t) {
  const r = Es(t), s = Math.round(t / r) * r, a = yi(r);
  return Number(s.toFixed(a));
}
function Ss({
  config: t,
  valueUsd: r,
  onChange: s,
  maxUsd: a = mi,
  disabled: n = !1,
  className: o = ""
}) {
  const l = Qt(Number.isFinite(r) ? r : 0, 0, a), c = $(() => zt(l, t), [l, t]), d = fi(c, t), u = gi(l, a), p = u / et * 100;
  return /* @__PURE__ */ i("div", { className: `cedros-tiered-slider ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ e("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            value: l || "",
            onChange: (f) => s(Fr(parseFloat(f.target.value) || 0)),
            placeholder: "Enter amount",
            disabled: n,
            min: 0,
            step: Es(l),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ i("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${c}`, children: [
          c === "sol_micro" && /* @__PURE__ */ e("img", { src: Vt, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
          d.label
        ] }),
        /* @__PURE__ */ e("span", { className: "cedros-tiered-slider-tier-detail", children: d.detail })
      ] })
    ] }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "range",
        min: 0,
        max: et,
        step: 1,
        value: u,
        onChange: (f) => s(Fr(wi(parseFloat(f.target.value), a))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${p}%, var(--cedros-border) ${p}%, var(--cedros-border) 100%)`
        },
        disabled: n,
        "aria-label": "Deposit amount slider"
      }
    ),
    d.note && /* @__PURE__ */ e("div", { className: "cedros-tiered-slider-note", children: d.note })
  ] });
}
function bi(t) {
  return t.companyFeePercent > 0 || t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap" || t.feePolicy === "user_pays_privacy";
}
function vi(t, r, s) {
  const { feePolicy: a, privacyFeePercent: n, swapFeePercent: o, companyFeePercent: l } = t;
  let c = l;
  return s || (a === "user_pays_all" ? (c += o, r && (c += n)) : a === "user_pays_privacy" && r ? c += n : a === "user_pays_swap" && (c += o)), c;
}
const Ve = 1e9, Se = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Vt
}, Pe = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, Ps = 1e4;
function Ai(t, r) {
  const s = r < t.publicMinUsd, a = r >= t.privateMinUsd, n = [], o = !s && a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0), l = !s && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0), c = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  if (o) {
    const d = t.privacyFeeFixedLamports / Ve, u = t.privacyFeePercent, p = d * t.solPriceUsd, f = r * (u / 100);
    n.push({ label: "Privacy", solAmount: d, percent: u, usdAmount: p + f });
  }
  if (l) {
    const d = t.swapFeeFixedLamports / Ve, u = t.swapFeePercent, p = d * t.solPriceUsd, f = r * (u / 100);
    n.push({ label: "Swap", solAmount: d, percent: u, usdAmount: p + f });
  }
  if (c) {
    const d = t.companyFeeFixedLamports / Ve, u = t.companyFeePercent, p = d * t.solPriceUsd, f = r * (u / 100);
    n.push({ label: "Service", solAmount: d, percent: u, usdAmount: p + f });
  }
  return n;
}
function xs(t, r, s) {
  const a = Ai(t, r), n = s < 0.01 ? 0.01 : s;
  if (a.length === 0)
    return `Total: $${n.toFixed(2)}`;
  const o = a.reduce((m, g) => m + g.solAmount, 0), l = a.reduce((m, g) => m + g.percent, 0), c = { fee: 7, sol: 8, rate: 7, usd: 8 }, d = (m) => {
    const g = m.label.padEnd(c.fee), y = m.solAmount.toFixed(4).padStart(6).padEnd(c.sol), A = (m.percent.toFixed(2) + "%").padStart(5).padEnd(c.rate), v = ("$" + Math.max(m.usdAmount, 0.01).toFixed(2)).padEnd(c.usd);
    return `${g} │ ${y} │ ${A} │ ${v}`;
  }, u = `${"Fee".padEnd(c.fee)} │ ${"SOL".padEnd(c.sol)} │ ${"+ Rate".padEnd(c.rate)} │ ${"= Total".padEnd(c.usd)}`, p = `${"─".repeat(c.fee)}─┼─${"─".repeat(c.sol)}─┼─${"─".repeat(c.rate)}─┼─${"─".repeat(c.usd)}`, f = ("$" + n.toFixed(2)).padEnd(c.usd), h = `${"TOTAL".padEnd(c.fee)} │ ${o.toFixed(4).padStart(6).padEnd(c.sol)} │ ${(l.toFixed(2) + "%").padStart(5).padEnd(c.rate)} │ ${f}`;
  return [u, p, ...a.map(d), p, h].join(`
`);
}
function Ni(t) {
  const r = [], s = t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0, a = t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0, n = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  return s && r.push("Privacy Cash fee"), a && r.push("swap fee"), n && r.push("company service fee"), r.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function rt(t, r) {
  if (r <= 0) return 0;
  const s = r < t.publicMinUsd, a = r >= t.privateMinUsd, n = vi(t, a, s);
  let o = t.companyFeeFixedLamports;
  s || (a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (o += t.privacyFeeFixedLamports), (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (o += t.swapFeeFixedLamports));
  const l = o / Ve * t.solPriceUsd, c = r * (n / 100);
  return l + c;
}
function Ls(t, r, s) {
  return t === "sol" ? "SOL" : t === "single-token" ? r.symbol : s.some((n) => n.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function Or(t) {
  return t.map((r) => r.trim()).filter(Boolean);
}
const Ts = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function Ds(t, r, s) {
  if (Ts.has(t.symbol)) return 1;
  const a = r.tokenPrices?.[t.symbol];
  if (a && a > 0) return a;
  if (t.symbol === "SOL") return r.solPriceUsd || null;
  const n = s?.[t.symbol];
  return n && n > 0 ? n : null;
}
function Ms(t, r) {
  const s = Ts.has(r) ? 2 : 4;
  return t.toFixed(s);
}
function dc({
  config: t,
  currencyMode: r,
  depositMethod: s,
  tokens: a = [],
  defaultToken: n,
  minAmount: o,
  maxAmount: l = 1e4,
  onSuccess: c,
  onError: d,
  onCancel: u,
  onUnlockRequired: p,
  onAuthorize: f,
  className: h = "",
  showStepIndicator: w = !0,
  pollInterval: m = 5e3,
  demoMode: g = !1,
  demoAutoConfirmMs: y,
  tokenPriceUsd: A,
  showExplainer: v = !1,
  siteName: k,
  explainerConfig: P
}) {
  const { deposit: S, getStatus: b, error: x, clearError: M } = hi(), E = tt(), D = Or(t.quickActionTokens), L = Or(t.customTokenSymbols), T = $(() => {
    const j = t.customTokens ?? [];
    if (j.length === 0) return a;
    const Y = new Set(a.map((re) => re.symbol)), X = [...a];
    for (const re of j)
      Y.has(re.symbol) || (X.push({
        mint: re.mint,
        symbol: re.symbol,
        name: re.symbol,
        // Use symbol as name for custom tokens
        decimals: re.decimals,
        logoUrl: re.logoUrl
      }), Y.add(re.symbol));
    return X;
  }, [a, t.customTokens]), R = $(() => {
    if (L.length === 0) return T;
    const j = T.filter((Y) => L.includes(Y.symbol));
    return j.length > 0 ? j : T;
  }, [T, L]), F = t.privateDepositsEnabled, _ = s ? s === "sign" && !F ? "receive" : s : F && E.hasExternalWallet ? "sign" : "receive", U = D[0] ? T.find((j) => j.symbol === D[0]) : void 0, J = r === "sol" ? Se : r === "single-token" ? U ?? T.find((j) => j.symbol === "USDC") ?? T[0] ?? Se : n ?? U ?? T.find((j) => j.symbol === "USDC") ?? T.find((j) => j.symbol !== "SOL") ?? T[0] ?? Se, K = C(() => v ? "explainer" : "unlock", [v]), [B, q] = N(K), [O, H] = N(J), [pe, oe] = N(""), [fe, de] = N(null), [V, z] = N(null), [Z, ce] = N(null), [me, G] = N(null), [ve, Me] = N(!1), [Bs, st] = N(!1), [Fe, Kt] = N(null);
  I(() => {
    q(K()), H(J), oe(""), de(null), z(null), ce(null), G(null), Me(!1), st(!1), Kt(null), M();
  }, [r, _, J, M, K]);
  const Us = o ?? t.privateMinSol, Is = l, Oe = parseFloat(pe), Yt = E.status === "enrolled_locked" || E.status === "enrolled_unlocked" || E.status === "unlocked", nt = Yt && E.isUnlocked, ot = Yt && !E.isUnlocked, Gt = C(() => {
    let X = _ === "sign" ? [
      { key: "unlock", label: "Authorize" },
      { key: "confirm", label: "Send" },
      { key: "signing", label: "Signing" },
      { key: "success", label: "Complete" }
    ] : [
      { key: "unlock", label: "Authorize" },
      { key: "show-address", label: "Send" },
      { key: "waiting", label: "Confirming" },
      { key: "success", label: "Complete" }
    ];
    return v && (X = [{ key: "explainer", label: "Info" }, ...X]), X;
  }, [_, v])(), Fs = Gt.findIndex((j) => j.key === B), Jt = C((j) => {
    H(j);
  }, []), Os = C(
    async (j) => {
      if (!f) {
        q(_ === "sign" ? "confirm" : "show-address");
        return;
      }
      st(!0), z(null);
      try {
        const X = await f(j, _ === "sign" ? Oe : null, O);
        ce(X.sessionId), G(X.depositAddress), q(_ === "sign" ? "confirm" : "show-address");
      } catch (Y) {
        const X = Y instanceof Error ? Y : new Error("Authorization failed");
        z(X.message);
      } finally {
        st(!1);
      }
    },
    [f, _, Oe, O]
  ), Ws = C(
    async (j, Y) => {
      M(), z(null), q("signing");
      const X = j ?? Oe, re = Y ?? O;
      if (!g) {
        if (ot && p) {
          p(), q("confirm");
          return;
        }
        if (!nt) {
          z("Wallet not ready"), q("error");
          return;
        }
      }
      try {
        const ue = Math.floor(X * Math.pow(10, re.decimals));
        if (g) {
          await new Promise((_e) => setTimeout(_e, 1500));
          const qe = {
            token: r === "sol" ? null : re,
            amount: X,
            amountSmallestUnit: ue,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: Z || `demo-session-${Date.now()}`,
            response: {
              sessionId: Z || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: ue,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          de(qe), q("success"), c?.(qe);
          return;
        }
        const le = await S(ue), We = {
          token: r === "sol" ? null : re,
          amount: X,
          amountSmallestUnit: ue,
          txSignature: le.txSignature,
          sessionId: le.sessionId,
          response: le,
          method: "sign"
        };
        de(We), q("success"), c?.(We);
      } catch (ue) {
        const le = ue instanceof Error ? ue : new Error("Deposit failed");
        z(le.message), q("error"), d?.(le);
      }
    },
    [
      S,
      Oe,
      O,
      r,
      g,
      Z,
      nt,
      ot,
      p,
      c,
      d,
      M
    ]
  ), qs = C(() => {
    q("waiting");
  }, []), at = C(async () => {
    const j = me || E.solanaPubkey;
    if (j)
      try {
        await navigator.clipboard.writeText(j), Me(!0), setTimeout(() => Me(!1), 2e3);
      } catch {
        const Y = document.createElement("textarea");
        Y.value = j, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), Me(!0), setTimeout(() => Me(!1), 2e3);
      }
  }, [me, E.solanaPubkey]);
  I(() => {
    if (!(B === "confirm" || B === "show-address" || B === "waiting") || !Z || g) return;
    let Y = !1, X = 0;
    const re = 360, ue = async () => {
      if (!(Y || X >= re)) {
        X++;
        try {
          const le = await b(Z);
          if (le.status === "completed" || le.status === "detected") {
            const We = le.amountLamports ? le.amountLamports / Math.pow(10, O.decimals) : 0, qe = le.amountLamports || 0, _e = {
              token: r === "sol" ? null : O,
              amount: We,
              amountSmallestUnit: qe,
              txSignature: le.txSignature || "",
              sessionId: Z,
              response: le,
              method: "receive",
              depositAddress: E.solanaPubkey ?? void 0
            };
            de(_e), q("success"), c?.(_e);
            return;
          }
        } catch {
        }
        Y || setTimeout(ue, m);
      }
    };
    return ue(), () => {
      Y = !0;
    };
  }, [
    B,
    Z,
    g,
    b,
    O,
    r,
    E.solanaPubkey,
    c,
    m
  ]), I(() => {
    if (!g || !y || B !== "waiting" || _ !== "receive" || !me) return;
    const j = window.setTimeout(() => {
      const Y = Fe ?? t.privateMinUsd, X = O.symbol === "SOL" && t.solPriceUsd > 0 ? Y / t.solPriceUsd : Y, re = Math.floor(X * Math.pow(10, O.decimals)), ue = {
        token: r === "sol" ? null : O,
        amount: X,
        amountSmallestUnit: re,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: Z || `demo-session-${Date.now()}`,
        response: {
          sessionId: Z || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: re,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: me ?? void 0
      };
      de(ue), q("success"), c?.(ue);
    }, y);
    return () => window.clearTimeout(j);
  }, [
    g,
    y,
    B,
    _,
    me,
    Fe,
    t,
    O,
    r,
    Z,
    c
  ]);
  const _s = C(() => {
    q(K()), oe(""), de(null), z(null), M();
  }, [K, M]);
  return t.enabled ? /* @__PURE__ */ i("div", { className: `cedros-deposit-flow ${h}`, children: [
    w && B !== "error" && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-steps", children: Gt.map((j, Y) => {
      const X = Fs >= Y, re = j.key === B;
      return /* @__PURE__ */ i(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${X ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${X ? "active" : ""} ${re ? "current" : ""}`,
                children: Y + 1
              }
            ),
            /* @__PURE__ */ e("span", { className: `cedros-deposit-flow-step-label ${X ? "active" : ""}`, children: j.label })
          ]
        },
        j.key
      );
    }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-content", children: [
      B === "explainer" && /* @__PURE__ */ e(
        ki,
        {
          siteName: k,
          config: P,
          depositConfig: t,
          currencyMode: r,
          token: O,
          tokens: R,
          onContinue: () => q("unlock"),
          onCancel: u
        }
      ),
      B === "unlock" && /* @__PURE__ */ e(
        Ci,
        {
          token: O,
          tokens: R,
          currencyMode: r,
          depositMethod: _,
          isAuthorizing: Bs,
          error: V,
          onAuthorize: Os,
          onBack: v ? () => q("explainer") : void 0,
          onCancel: u
        }
      ),
      B === "confirm" && _ === "sign" && /* @__PURE__ */ e(
        Ei,
        {
          token: O,
          tokens: T,
          quickActionSymbols: D,
          customTokenSymbols: L,
          currencyMode: r,
          minAmount: Us,
          maxAmount: Is,
          depositAddress: me || E.solanaPubkey,
          walletReady: nt || g,
          needsUnlock: ot && !g,
          copied: ve,
          isListening: !!Z && !g,
          config: t,
          onCopy: at,
          onTokenSelect: Jt,
          onUnlockRequired: p,
          onConfirm: (j, Y) => Ws(j, Y),
          onBack: () => q("unlock"),
          onCancel: u
        }
      ),
      B === "signing" && /* @__PURE__ */ e(Si, { depositAddress: E.solanaPubkey }),
      B === "show-address" && /* @__PURE__ */ e(
        Pi,
        {
          token: O,
          tokens: T,
          quickActionSymbols: D,
          customTokenSymbols: L,
          tokenPriceUsd: A,
          currencyMode: r,
          depositAddress: me || E.solanaPubkey,
          copied: ve,
          isListening: !!Z && !g,
          config: t,
          onCopy: at,
          onTokenSelect: Jt,
          onAmountChange: Kt,
          onSent: qs,
          onBack: () => q("unlock"),
          onCancel: u
        }
      ),
      B === "waiting" && /* @__PURE__ */ e(
        xi,
        {
          token: O,
          depositAddress: me || E.solanaPubkey,
          copied: ve,
          feeLine: Fe ? `Fees: $${Math.max(rt(t, Fe), 0.01).toFixed(2)} total` : "Fees: calculated after deposit",
          onCopy: at
        }
      ),
      B === "success" && fe && /* @__PURE__ */ e(Li, { result: fe, config: t, onNewDeposit: _s }),
      B === "error" && /* @__PURE__ */ e(
        Ti,
        {
          error: V || x || "An error occurred",
          onRetry: () => q("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ e("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${h}`, children: /* @__PURE__ */ e("p", { children: "Deposits are not currently available." }) });
}
function ki({
  siteName: t,
  config: r,
  depositConfig: s,
  currencyMode: a,
  token: n,
  tokens: o,
  onContinue: l,
  onCancel: c
}) {
  const d = r?.title ?? "How Deposits Work", u = r?.exchangeName ?? "Coinbase", p = nn(r?.exchangeUrl) ?? "https://www.coinbase.com", f = r?.showExchangeSuggestion !== !1, h = Ls(a, n, o), w = t ? `${t} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", m = r?.body ?? w, g = bi(s), y = Ni(s);
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: d }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: m }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-content", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-shield" }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ e("strong", { children: "Private & Secure" }),
          /* @__PURE__ */ e("p", { children: "Your deposits are protected by cryptographic privacy technology." })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-bolt" }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ e("strong", { children: "Fast Transactions" }),
          /* @__PURE__ */ e("p", { children: "Solana transactions confirm in seconds, not minutes." })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-coin" }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ e("strong", { children: g ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ e("p", { children: y })
        ] })
      ] })
    ] }),
    f && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ e("strong", { children: "New to Solana?" }),
      " You can purchase ",
      h,
      " using your credit card at",
      " ",
      /* @__PURE__ */ e("a", { href: p, target: "_blank", rel: "noopener noreferrer", children: u }),
      ", then send it here to fund your account."
    ] }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      c && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: c,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: l,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function Ci({
  token: t,
  tokens: r,
  currencyMode: s,
  depositMethod: a,
  isAuthorizing: n,
  error: o,
  onAuthorize: l,
  onBack: c
}) {
  const [d, u] = N(""), p = Ls(s, t, r), f = (h) => {
    h.preventDefault(), d.trim() && l(d);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: a === "sign" ? s === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${p} deposit. This allows us to process your withdrawal when the privacy period ends.` : s === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${p} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ i("form", { onSubmit: f, children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: d,
            onChange: (h) => u(h.target.value),
            className: "cedros-deposit-flow-input",
            placeholder: "Enter your password",
            disabled: n,
            autoComplete: "current-password"
          }
        )
      ] }),
      o && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-error", children: o }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
            onClick: c,
            disabled: n,
            children: "Back"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
            disabled: !d.trim() || n,
            children: n ? "Authorizing..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function Ei({
  token: t,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: a,
  currencyMode: n,
  minAmount: o,
  maxAmount: l,
  depositAddress: c,
  walletReady: d,
  needsUnlock: u,
  copied: p,
  isListening: f,
  config: h,
  onCopy: w,
  onTokenSelect: m,
  onUnlockRequired: g,
  onConfirm: y,
  onBack: A
}) {
  const [v, k] = N(h.privateMinUsd), [P, S] = N(!1), [b, x] = N(!1), [M, E] = N(0), [D, L] = N(null), R = zt(v, h) === "sol_micro", F = t.symbol === Pe.symbol, _ = $(() => {
    const V = a.length === 0 ? r : r.filter((ce) => a.includes(ce.symbol)), z = V.length > 0 ? V : r;
    return z.some((ce) => ce.symbol === Pe.symbol) ? z : [...z, Pe];
  }, [r, a]), U = rt(h, v), J = U < 0.01 ? 0.01 : U, K = F ? "Fees: calculated after deposit" : `Fees: $${J.toFixed(2)} total`, B = F ? "" : xs(h, v, U), q = Ds(R ? Se : t, h), O = q ? v / q : t.symbol === "SOL" && h.solPriceUsd > 0 ? v / h.solPriceUsd : v, H = O ? Ms(O, R ? "SOL" : t.symbol) : null, oe = v - U <= 0 && v > 0, fe = !F && v > 0 && !oe && O >= o && O <= l;
  I(() => {
    if (n === "multi-token")
      if (R && t.symbol !== "SOL") {
        L(t);
        const V = r.find((z) => z.symbol === "SOL");
        V && m(V);
      } else !R && D && t.symbol === "SOL" && (m(D), L(null));
  }, [R, t.symbol, n, r, m, D, t]);
  const de = () => {
    fe && y(O, t);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    n === "multi-token" && !R && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((V) => {
          const z = r.find((ce) => ce.symbol === V), Z = t.symbol === V;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${Z ? "is-active" : ""}`,
              onClick: () => {
                z && (S(!1), m(z));
              },
              disabled: !z,
              children: [
                z?.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: z.logoUrl,
                    alt: `${V} logo`
                  }
                ),
                V
              ]
            },
            V
          );
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${P ? "is-active" : ""}`,
            onClick: () => {
              S(!0), E((V) => V + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      P && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        ks,
        {
          tokens: _,
          selectedToken: t,
          onSelect: m,
          openSignal: M
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ e(
      Ss,
      {
        config: h,
        valueUsd: v,
        onChange: k,
        maxUsd: Ps
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: F ? "Sign to send tokens to this address" : `Sign to send ${H ?? "--"} ${R ? "SOL" : t.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ e("code", { className: "cedros-deposit-flow-address", children: c || "Loading..." }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: w,
              title: "Copy address",
              disabled: !c,
              children: p ? "✓" : "⧉"
            }
          ),
          c && /* @__PURE__ */ e(
            "a",
            {
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
              href: `https://orbmarkets.io/account/${c}`,
              target: "_blank",
              rel: "noopener noreferrer",
              title: "View on Orb Markets",
              children: "↗"
            }
          )
        ] })
      ] }),
      p && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    oe && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ e("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ e("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ i("span", { children: [
          K,
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${b ? "is-open" : ""}`,
              "data-tooltip": B,
              "aria-label": `Fee breakdown: ${B.replaceAll(`
`, ", ")}`,
              "aria-expanded": b,
              onClick: (V) => {
                V.stopPropagation(), x((z) => !z);
              },
              onBlur: () => x(!1),
              onKeyDown: (V) => {
                V.key === "Escape" && x(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ e("span", { children: "Credits appear after network confirmation." })
      ] })
    ] }),
    f && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for incoming transfers. We will confirm automatically." }),
    u && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-warning", children: [
      /* @__PURE__ */ e("p", { children: "Your wallet is locked. Unlock it to continue." }),
      g && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: g,
          children: "Unlock Wallet"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: A,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: de,
          disabled: !fe || !d || !c,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function Si({ depositAddress: t }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Signing Transfer" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Approve the transfer in your wallet extension..." }),
    t && /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-signing-dest", children: [
      "Sending to:",
      " ",
      /* @__PURE__ */ i("code", { children: [
        t.slice(0, 6),
        "...",
        t.slice(-4)
      ] })
    ] })
  ] });
}
function Pi({
  token: t,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: a,
  tokenPriceUsd: n,
  currencyMode: o,
  depositAddress: l,
  copied: c,
  isListening: d,
  config: u,
  onCopy: p,
  onTokenSelect: f,
  onAmountChange: h,
  onSent: w,
  onBack: m
}) {
  const [g, y] = N(u.privateMinUsd), [A, v] = N(!1), [k, P] = N(!1), [S, b] = N(0), [x, M] = N(null), D = zt(g, u) === "sol_micro", L = t.symbol === Pe.symbol, T = $(() => {
    const O = a.length === 0 ? r : r.filter((oe) => a.includes(oe.symbol)), H = O.length > 0 ? O : r;
    return H.some((oe) => oe.symbol === Pe.symbol) ? H : [...H, Pe];
  }, [r, a]), R = rt(u, g), F = R < 0.01 ? 0.01 : R, _ = L ? "Fees: calculated after deposit" : `Fees: $${F.toFixed(2)} total`, U = L ? "" : xs(u, g, R), J = L || g > 0, K = Ds(D ? Se : t, u, n), B = K ? g / K : null, q = B ? Ms(B, t.symbol) : null;
  return I(() => {
    if (o === "multi-token")
      if (D && t.symbol !== "SOL") {
        M(t);
        const O = r.find((H) => H.symbol === "SOL");
        O && f(O);
      } else !D && x && t.symbol === "SOL" && (f(x), M(null));
  }, [D, t.symbol, o, r, f, x, t]), I(() => {
    h(g);
  }, [g, h]), l ? /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    o === "multi-token" && !D && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((O) => {
          const H = r.find((oe) => oe.symbol === O), pe = t.symbol === O;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${pe ? "is-active" : ""}`,
              onClick: () => {
                H && (v(!1), f(H));
              },
              disabled: !H,
              children: [
                H?.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: H.logoUrl,
                    alt: `${O} logo`
                  }
                ),
                O
              ]
            },
            O
          );
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${A ? "is-active" : ""}`,
            onClick: () => {
              v(!0), b((O) => O + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      A && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        ks,
        {
          tokens: T,
          selectedToken: t,
          onSelect: f,
          openSignal: S
        }
      ) })
    ] }),
    !L && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ e(
        Ss,
        {
          config: u,
          valueUsd: g,
          onChange: y,
          maxUsd: Ps
        }
      )
    ] }),
    L && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: L ? "Send any token to this address" : `Send ${q ?? "--"} ${D ? "SOL" : t.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ e("code", { className: "cedros-deposit-flow-address", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: p,
            title: "Copy address",
            children: c ? "✓" : "📋"
          }
        )
      ] }),
      c && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ e("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ i("span", { children: [
          _,
          !L && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${k ? "is-open" : ""}`,
              "data-tooltip": U,
              "aria-label": `Fee breakdown: ${U.replaceAll(`
`, ", ")}`,
              "aria-expanded": k,
              onClick: (O) => {
                O.stopPropagation(), P((H) => !H);
              },
              onBlur: () => P(!1),
              onKeyDown: (O) => {
                O.key === "Escape" && P(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ e("span", { children: "Credits appear after confirmation (typically ~30s)." })
      ] })
    ] }),
    d && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for your deposit. We'll notify you when it arrives." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: m,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: w,
          disabled: !J,
          children: "I've Sent It"
        }
      )
    ] })
  ] }) : /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-error-icon", children: "!" }),
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Wallet Not Ready" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Your embedded wallet is not set up. Please complete wallet enrollment first." })
  ] });
}
function xi({ token: t, depositAddress: r, copied: s, feeLine: a, onCopy: n }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Waiting for Deposit" }),
    /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Looking for incoming ",
      /* @__PURE__ */ e("strong", { children: t.symbol }),
      " deposits..."
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-waiting-info", children: [
      /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-waiting-text", children: "Once your transaction is confirmed on the Solana network, your account will be credited automatically. This usually takes 20-30 seconds." }),
      r && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Deposit address" }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
          /* @__PURE__ */ i("code", { className: "cedros-deposit-flow-address", children: [
            r.slice(0, 6),
            "...",
            r.slice(-6)
          ] }),
          /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
                onClick: n,
                title: "Copy address",
                children: s ? "✓" : "⧉"
              }
            ),
            /* @__PURE__ */ e(
              "a",
              {
                className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
                href: `https://orbmarkets.io/account/${r}`,
                target: "_blank",
                rel: "noopener noreferrer",
                title: "View on Orb Markets",
                children: "↗"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ e("span", { children: "Send only on the Solana network." })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ e("span", { children: a })
        ] })
      ] })
    ] })
  ] });
}
function Li({ result: t, config: r, onNewDeposit: s }) {
  const a = t.token ?? Se, n = a.symbol === "SOL" && r.solPriceUsd > 0 ? t.amount * r.solPriceUsd : t.amount, o = rt(r, n), l = Math.max(n - o, 0), c = o < 0.01 ? 0.01 : o;
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-success-icon", children: "✓" }),
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Successful!" }),
    /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Your deposit of ",
      t.amount.toLocaleString(),
      " ",
      a.symbol,
      " has been received."
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-label", children: "Transaction" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-tx", children: [
          /* @__PURE__ */ i(
            "a",
            {
              href: `https://orbmarkets.io/tx/${t.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              children: [
                t.txSignature.slice(0, 8),
                "...",
                t.txSignature.slice(-8)
              ]
            }
          ),
          /* @__PURE__ */ e(
            "a",
            {
              className: "cedros-deposit-flow-tx-action",
              href: `https://orbmarkets.io/tx/${t.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "View transaction on Orb Markets",
              title: "View transaction",
              children: "↗"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-label", children: "Deposit Amount" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value", children: [
          "$",
          n.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-label", children: "Total Fees" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-fee", children: [
          "-$",
          c.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          l.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-label", children: "Available" }),
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-value", children: "Immediately" })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
        onClick: s,
        children: "Make Another Deposit"
      }
    ) })
  ] });
}
function Ti({ error: t, onRetry: r, onCancel: s }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-error-icon", children: "✕" }),
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Failed" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-error-message", children: t }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: s,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: r,
          children: "Try Again"
        }
      )
    ] })
  ] });
}
const Di = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", Mi = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ri = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Bi = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ui = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ii = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Fi = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", Oi = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Wi = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e", uc = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Vt
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Ii
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Wi
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: Ri
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: Oi
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: Ui
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Fi
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: Mi
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: Di
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Bi
  }
];
function hc({
  showAllCurrencies: t = !1,
  refreshInterval: r = 0,
  compact: s = !1,
  className: a = "",
  onLoad: n
}) {
  const { getBalance: o, getAllBalances: l, isLoading: c, error: d, clearError: u } = jt(), [p, f] = N([]), [h, w] = N(null), m = C(async () => {
    try {
      if (t) {
        const g = await l();
        f(g), n?.(g);
      } else {
        const g = await o();
        f([g]), n?.([g]);
      }
      w(null);
    } catch (g) {
      w(g instanceof Error ? g.message : "Failed to load balance");
    }
  }, [t, o, l, n]);
  if (I(() => {
    m();
  }, [m]), I(() => {
    if (r <= 0) return;
    const g = setInterval(m, r);
    return () => clearInterval(g);
  }, [r, m]), h || d)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-error", children: h || d }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            u(), w(null), m();
          },
          children: "Retry"
        }
      )
    ] });
  if (c && p.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (s) {
    const g = p[0];
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${a}`, children: [
      g ? /* @__PURE__ */ e(
        "span",
        {
          className: "cedros-credit-value",
          title: `${g.balanceLamports} lamports`,
          children: g.display
        }
      ) : /* @__PURE__ */ e("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      c && /* @__PURE__ */ e("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
    ] });
  }
  return /* @__PURE__ */ i("div", { className: `cedros-credit-balance ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-credit-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-credit-title", children: "Credit Balance" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-credit-refresh",
          onClick: m,
          disabled: c,
          title: "Refresh balance",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    p.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-credit-list", children: p.map((g) => /* @__PURE__ */ i("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-currency", children: g.currency }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-amount", children: g.display })
    ] }, g.currency)) })
  ] });
}
const Mt = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function qi(t, r) {
  const s = t < 0, a = Math.abs(t), n = r.toUpperCase() === "SOL", l = a / Math.pow(10, n ? 9 : 6), c = s ? "-" : "+";
  return n ? `${c}${l.toFixed(4)} SOL` : `${c}$${l.toFixed(2)}`;
}
function _i(t) {
  const r = new Date(t), s = /* @__PURE__ */ new Date(), a = s.getTime() - r.getTime(), n = Math.floor(a / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const o = Math.floor(a / 36e5);
    if (o === 0) {
      const l = Math.floor(a / 6e4);
      return l < 1 ? "Just now" : `${l}m ago`;
    }
    return `${o}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function ji(t) {
  return t ? {
    deposit: "Deposit",
    spend: "Usage",
    usage: "Usage",
    charge: "Charge",
    refund: "Refund",
    adjustment: "Adjustment",
    bonus: "Bonus",
    credit: "Credit"
  }[t.toLowerCase()] || t : "Transaction";
}
function $i(t, r) {
  const s = (t || "").toLowerCase();
  return s === "deposit" ? "↓" : s === "spend" || s === "usage" || s === "charge" ? "↑" : s === "refund" ? "←" : s === "bonus" || s === "credit" ? "★" : r ? "+" : "−";
}
function mc({
  defaultTab: t = "all",
  pageSize: r = 10,
  refreshInterval: s = 0,
  className: a = "",
  onLoad: n,
  onTransactionClick: o
}) {
  const { getHistory: l, isLoading: c, error: d, clearError: u } = jt(), [p, f] = N(t), [h, w] = N([]), [m, g] = N(0), [y, A] = N(0), [v, k] = N(null), P = Mt.find((T) => T.key === p) || Mt[0], S = $(() => P.txTypes === null ? h : h.filter((T) => {
    const R = T.txType || "";
    return P.txTypes.some((F) => R.toLowerCase().includes(F.toLowerCase()));
  }), [h, P.txTypes]), b = C(async () => {
    try {
      const T = await l({ limit: r * 3, offset: y });
      w(T.transactions), g(T.total), n?.(T), k(null);
    } catch (T) {
      k(T instanceof Error ? T.message : "Failed to load history");
    }
  }, [r, y, l, n]);
  I(() => {
    A(0);
  }, [p]), I(() => {
    b();
  }, [b]), I(() => {
    if (s <= 0) return;
    const T = setInterval(b, s);
    return () => clearInterval(T);
  }, [s, b]);
  const x = Math.ceil(m / r), M = Math.floor(y / r) + 1, E = (T) => {
    const R = (T - 1) * r;
    A(Math.max(0, Math.min(R, Math.max(0, m - 1))));
  }, D = (T) => {
    f(T);
  };
  if (v || d)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-error", children: v || d }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            u(), k(null), b();
          },
          children: "Retry"
        }
      )
    ] });
  if (c && h.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const L = (T) => T.txTypes === null ? h.length : h.filter((R) => {
    const F = R.txType || "";
    return T.txTypes.some((_) => F.toLowerCase().includes(_.toLowerCase()));
  }).length;
  return /* @__PURE__ */ i("div", { className: `cedros-tx-history ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: b,
          disabled: c,
          title: "Refresh",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-tx-tabs", children: Mt.map((T) => {
      const R = L(T), F = p === T.key;
      return /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${F ? "cedros-tx-tab-active" : ""}`,
          onClick: () => D(T.key),
          children: [
            T.label,
            R > 0 && /* @__PURE__ */ e("span", { className: "cedros-tx-tab-count", children: R })
          ]
        },
        T.key
      );
    }) }),
    S.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: p === "all" ? "No transactions yet." : `No ${P.label.toLowerCase()} found.` }),
      p === "all" && /* @__PURE__ */ e("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ i(te, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: S.slice(0, r).map((T) => {
        const R = T.amountLamports >= 0;
        return /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-tx-item ${R ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => o?.(T),
            onKeyDown: (F) => {
              (F.key === "Enter" || F.key === " ") && (F.preventDefault(), o?.(T));
            },
            role: o ? "button" : void 0,
            tabIndex: o ? 0 : void 0,
            children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `cedros-tx-icon ${R ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: $i(T.txType, R)
                }
              ),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-type", children: ji(T.txType) }),
                  /* @__PURE__ */ e(
                    "span",
                    {
                      className: `cedros-tx-amount ${R ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: qi(T.amountLamports, T.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-description", children: T.description }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: _i(T.createdAt) })
                ] })
              ] })
            ]
          },
          T.id
        );
      }) }),
      x > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => E(M - 1),
            disabled: M <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          M,
          " of ",
          x
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => E(M + 1),
            disabled: M >= x,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function pc({
  brandLogo: t,
  brandName: r,
  title: s = "Welcome back",
  subtitle: a = "Login with your Apple or Google account",
  termsText: n,
  onSuccess: o,
  defaultTab: l = "login",
  children: c,
  className: d = ""
}) {
  return /* @__PURE__ */ i("div", { className: `cedros-full-page-layout ${d}`, children: [
    (t || r) && /* @__PURE__ */ i("div", { className: "cedros-brand-header", children: [
      t,
      r && /* @__PURE__ */ e("span", { className: "cedros-brand-name", children: r })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-full-page-card", children: [
      /* @__PURE__ */ i("div", { className: "cedros-full-page-header", children: [
        /* @__PURE__ */ e("h1", { className: "cedros-full-page-title", children: s }),
        a && /* @__PURE__ */ e("p", { className: "cedros-full-page-subtitle", children: a })
      ] }),
      c ?? /* @__PURE__ */ e(_t, { defaultTab: l, onSuccess: o })
    ] }),
    n && /* @__PURE__ */ e("p", { className: "cedros-terms-footer", children: n })
  ] });
}
function fc({
  brandName: t = "Your Brand",
  brandLogo: r,
  tagline: s = "Your tagline goes here. Make it compelling.",
  title: a = "Sign in",
  subtitle: n = "Enter your credentials to access your account",
  onSuccess: o,
  defaultTab: l = "login",
  children: c,
  className: d = ""
}) {
  return /* @__PURE__ */ i("div", { className: `cedros-split-page-layout ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-split-page-brand", children: /* @__PURE__ */ i("div", { className: "cedros-split-page-brand-content", children: [
      r ?? /* @__PURE__ */ e("div", { className: "cedros-split-page-logo", children: t.charAt(0).toUpperCase() }),
      /* @__PURE__ */ e("h1", { className: "cedros-split-page-brand-name", children: t }),
      s && /* @__PURE__ */ e("p", { className: "cedros-split-page-tagline", children: s })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "cedros-split-page-form", children: /* @__PURE__ */ i("div", { className: "cedros-split-page-form-content", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-split-page-title", children: a }),
      n && /* @__PURE__ */ e("p", { className: "cedros-split-page-subtitle", children: n }),
      c ?? /* @__PURE__ */ e(_t, { defaultTab: l, onSuccess: o })
    ] }) })
  ] });
}
class zi {
  client;
  constructor(r, s, a, n) {
    this.client = new ie({ baseUrl: r, timeoutMs: s, retryAttempts: a, getAccessToken: n });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (r) {
      throw W(r, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (r) {
      throw W(r, "Failed to revoke sessions");
    }
  }
}
function gc() {
  const { config: t, authState: r, _internal: s } = se(), [a, n] = N([]), [o, l] = N(!1), [c, d] = N(null), u = $(
    () => new zi(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      s?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, s]
  ), p = C(async () => {
    if (r !== "authenticated") {
      n([]);
      return;
    }
    l(!0), d(null);
    try {
      const w = await u.listSessions();
      n(w);
    } catch (w) {
      d(w);
    } finally {
      l(!1);
    }
  }, [r, u]);
  I(() => {
    r === "authenticated" ? p() : n([]);
  }, [r, p]);
  const f = C(async () => {
    l(!0), d(null);
    try {
      const w = await u.revokeAllSessions();
      return await p(), w;
    } catch (w) {
      throw d(w), w;
    } finally {
      l(!1);
    }
  }, [u, p]), h = $(() => a.filter((w) => !w.isCurrent).length, [a]);
  return {
    sessions: a,
    isLoading: o,
    error: c,
    fetchSessions: p,
    revokeAllSessions: f,
    otherSessionCount: h
  };
}
function wc() {
  const { config: t, _internal: r } = se(), [s, a] = N({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), n = $(
    () => new ms(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      r?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), o = C(
    async (d) => {
      a((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await n.authorize(d), p = {
          allowed: u.allowed,
          reason: u.reason,
          isLoading: !1,
          error: null
        };
        return a(p), p;
      } catch (u) {
        const p = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: u
        };
        return a(p), p;
      }
    },
    [n]
  ), l = C(
    async (d) => (await o(d)).allowed,
    [o]
  ), c = C(() => {
    a({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: l,
    lastCheck: s,
    clearCheck: c,
    checkAuthorization: o
  };
}
function yc() {
  const t = Le(), [r, s] = N(!1), [a, n] = N(null), [o, l] = N(null), c = $(() => t ? new ie({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = C(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const f = await c.get("/wallet/pending-recovery");
      l(f);
    } catch (f) {
      const h = W(f, "Failed to fetch pending recovery");
      throw n(h.message), h;
    } finally {
      s(!1);
    }
  }, [c]), u = C(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const f = { confirmed: !0 };
      await c.post("/wallet/acknowledge-recovery", f), l(null);
    } catch (f) {
      const h = W(f, "Failed to acknowledge recovery");
      throw n(h.message), h;
    } finally {
      s(!1);
    }
  }, [c]), p = C(() => n(null), []);
  return I(() => {
    c && t?.authState === "authenticated" && d().catch(() => {
    });
  }, [c, t?.authState, d]), {
    hasPendingRecovery: o?.hasPendingRecovery ?? !1,
    recoveryType: o?.recoveryType ?? null,
    recoveryPhrase: o?.recoveryPhrase ?? null,
    expiresAt: o?.expiresAt ? new Date(o.expiresAt) : null,
    fetchPendingRecovery: d,
    acknowledgeRecovery: u,
    isLoading: r,
    error: a,
    clearError: p
  };
}
function bc(t = {}) {
  const { onExternalSign: r } = t, { solanaPubkey: s, hasExternalWallet: a, status: n, isUnlocked: o } = tt(), {
    signTransaction: l,
    isSigning: c,
    error: d,
    clearError: u
  } = vo(), p = $(() => a && r ? "external" : n === "enrolled_locked" || n === "enrolled_unlocked" ? "sss" : "none", [a, r, n]), f = p !== "none", h = n === "enrolled_locked" || n === "enrolled_unlocked";
  return {
    signTransaction: C(
      async (m, g) => {
        if (p === "external") {
          if (!r)
            throw new Error("External wallet signing callback not provided");
          return r(m);
        }
        if (p === "sss") {
          if (!g && !o)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return g ? l(m, g) : l(m);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [p, r, o, l]
    ),
    signingMethod: p,
    canSign: f,
    isSigning: c,
    publicKey: s,
    hasExternalWallet: a,
    hasSssWallet: h,
    isSssUnlocked: o,
    error: d,
    clearError: u
  };
}
const Ht = Gs(null), It = {
  auth: {
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Name",
    optional: "(optional)",
    createPassword: "Create a password",
    confirmYourPassword: "Confirm your password",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "Your name"
  },
  buttons: {
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    createAccount: "Create account",
    continueWithGoogle: "Continue with Google",
    continueWithSolana: "Connect Wallet",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset password",
    sendVerification: "Send verification email"
  },
  messages: {
    signingIn: "Signing in...",
    signingUp: "Signing up...",
    creatingAccount: "Creating account...",
    connectingWallet: "Connecting wallet...",
    verifyingSignature: "Verifying signature...",
    passwordsDoNotMatch: "Passwords do not match",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    orContinueWith: "Or continue with"
  },
  errors: {
    invalidCredentials: "Invalid email or password",
    emailExists: "An account with this email already exists",
    invalidEmail: "Please enter a valid email address",
    weakPassword: "Password does not meet requirements",
    networkError: "Network error. Please try again.",
    unknownError: "An error occurred. Please try again.",
    walletNotFound: "No wallet found. Please install a Solana wallet.",
    signatureRejected: "Signature request was rejected",
    challengeExpired: "Challenge expired. Please try again."
  },
  passwordValidation: {
    minLength: "At least 10 characters",
    uppercase: "At least 1 uppercase letter",
    lowercase: "At least 1 lowercase letter",
    number: "At least 1 number",
    special: "At least 1 special character",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong"
  }
};
function Vi(t, r) {
  return Rs(t, r);
}
function Rs(t, r) {
  const s = { ...t };
  for (const a in r)
    if (Object.prototype.hasOwnProperty.call(r, a)) {
      const n = t[a], o = r[a];
      typeof n == "object" && n !== null && typeof o == "object" && o !== null ? s[a] = Rs(
        n,
        o
      ) : o !== void 0 && (s[a] = o);
    }
  return s;
}
function vc({
  children: t,
  locale: r = "en",
  translations: s
}) {
  const a = $(() => ({ t: s ? Vi(It, s) : It, locale: r }), [s, r]);
  return /* @__PURE__ */ e(Ht.Provider, { value: a, children: t });
}
function Ac() {
  return Hr(Ht)?.t ?? It;
}
function Nc() {
  return Hr(Ht)?.locale ?? "en";
}
export {
  ha as AdminDepositList,
  ps as AdminDepositStats,
  ba as AdminPrivacyPeriodDeposits,
  La as AdminUserList,
  Ca as AdminWithdrawalHistory,
  pa as AdminWithdrawalQueue,
  Dn as AppleLoginButton,
  ac as CapabilityWarning,
  cc as CedrosAdminDashboard,
  Ec as CedrosLoginProvider,
  hc as CreditBalance,
  dc as DepositFlow,
  en as EmailLoginForm,
  tn as EmailRegisterForm,
  Wn as ErrorBoundary,
  ae as ErrorMessage,
  xn as ForgotPasswordForm,
  pc as FullPageLayout,
  an as GoogleLoginButton,
  mc as History,
  vc as I18nProvider,
  to as InviteForm,
  so as InviteList,
  ee as LoadingSpinner,
  ec as LoginButton,
  _t as LoginForm,
  tc as LoginModal,
  Gn as MemberList,
  sc as OrgSelector,
  nc as OrgSwitcher,
  Xr as OtpInput,
  Fn as PasskeyLoginButton,
  No as PasskeyPrompt,
  xe as PasswordInput,
  mo as RecoveryPhraseDisplay,
  po as RecoveryPhraseInput,
  rc as ResetPasswordForm,
  uc as SUPPORTED_TOKENS,
  oc as SessionList,
  cn as SolanaLoginButton,
  fc as SplitPageLayout,
  Ho as SystemSettings,
  Ss as TieredAmountSlider,
  ks as TokenSelector,
  lc as TotpSettings,
  ui as TotpSetup,
  Lc as TotpVerify,
  Io as WalletAddressRow,
  bo as WalletEnrollment,
  ic as WalletManager,
  Do as WalletRecovery,
  Fo as WalletStatus,
  So as WalletUnlock,
  It as defaultTranslations,
  Sc as getEmbeddedWalletInfo,
  zt as getTierForAmount,
  Pc as isEmbeddedWalletAvailable,
  Vi as mergeTranslations,
  De as useAdminDeposits,
  fs as useAdminUsers,
  Tn as useAppleAuth,
  $s as useAuth,
  wc as useAuthorize,
  se as useCedrosLogin,
  jt as useCredits,
  hi as useDeposit,
  Tc as useEmailAuth,
  Bc as useGoogleAuth,
  Dc as useInstantLink,
  ia as useInvites,
  Nc as useLocale,
  oa as useMembers,
  sa as useOrgs,
  Ao as usePasskeySigning,
  is as usePasswordReset,
  yc as usePendingRecovery,
  gc as useSessions,
  Ic as useSolanaAuth,
  jo as useSystemSettings,
  Ns as useTotp,
  Mc as useTotpVerify,
  bc as useTransactionSigning,
  Ac as useTranslations,
  tt as useWallet,
  yo as useWalletEnrollment,
  Ie as useWalletMaterial,
  To as useWalletRecovery,
  vo as useWalletSigning,
  In as useWebAuthn,
  on as validatePassword
};
