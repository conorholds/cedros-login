import { f as He, h as Gs, u as et, i as Js, j as Xs, k as Pe, w as qr, g as Zs, b as jr, t as zr, c as we, a as Vr, D as Qe, l as Hr, r as eo, m as zt, n as Qr, o as to, p as Kr, q as tt } from "./useAuth-CVLv2oKA.js";
import { C as nl, x as al, s as il } from "./useAuth-CVLv2oKA.js";
import { u as te, A as ae, h as W, a as ve } from "./useCedrosLogin-CFfID-0i.js";
import { b as ll, c as dl } from "./useCedrosLogin-CFfID-0i.js";
import { jsx as e, jsxs as i, Fragment as $ } from "react/jsx-runtime";
import { useState as k, useRef as J, useMemo as q, useEffect as _, useCallback as x, useId as Yr, Fragment as ro, Component as so, createContext as oo, useContext as $r } from "react";
import { L as j } from "./LoadingSpinner-6vml-zwr.js";
import { a as Gr, s as no } from "./sanitization-CQ-H1MSg.js";
import { b as Jr, E as ao, a as io, P as he, O as Xr } from "./EmailRegisterForm-CCEuQA-w.js";
import { T as hl, u as pl, c as ml } from "./EmailRegisterForm-CCEuQA-w.js";
import { b as Zr, v as rt } from "./validation-B8kMV3BL.js";
import { E as X } from "./ErrorMessage-CcEK0pYO.js";
import { G as co } from "./GoogleLoginButton-6ip-vudk.js";
import { u as gl } from "./GoogleLoginButton-6ip-vudk.js";
import { d as or, S as lo } from "./SolanaLoginButton-B04dib6X.js";
import { r as yl, u as bl } from "./SolanaLoginButton-B04dib6X.js";
import { c as uo, d as ho, u as po, a as mo, M as fo, I as go, b as wo, P as yo } from "./PermissionsSection-DNzOL1xW.js";
import { u as bo } from "./useSystemSettings-rgskaDqP.js";
import { C as Ao, S as es, a as vo, u as ko, A as No } from "./AutosaveStatus-f-jw25Ay.js";
import { u as Co, O as Eo } from "./useOrgs-C90KT9KP.js";
import { A as So, a as xo } from "./AdminDepositList-BUm_ZcAW.js";
import { A as Po, a as Lo, b as Mo, c as To } from "./AdminWithdrawalHistory-C76bkbjX.js";
import { u as Bo, A as Ro, a as Io } from "./useUsersStatsSummary-5DJwzntC.js";
import { b as vl } from "./useUsersStatsSummary-5DJwzntC.js";
import { S as ts } from "./StatsBar-BX-hHtTq.js";
import { P as Do } from "./plugin-BbExid4E.js";
import { I as Nl, A as Cl, C as El, c as Sl, c as xl, u as Pl } from "./plugin-BbExid4E.js";
import { A as Uo } from "./AuthenticationSettings-DIVk0OP8.js";
import { E as Fo } from "./EmbeddedWalletSettings-Dmi-EQ7W.js";
import { A as _o, S as Wo, P as Oo } from "./EmailSettings-BAuQtEfM.js";
import { E as Ml } from "./EmailSettings-BAuQtEfM.js";
import { C as qo } from "./CreditSystemSettings-C6ed3yp7.js";
import { S as jo } from "./ServerSettings-BT9weFPz.js";
import { b as zo, c as Vo, s as rs, g as ss, p as os, a as ns, d as Ho, e as Qo } from "./shamir-R8ddesFt.js";
import { u as Bl } from "./useAdminDeposits-C76B2Q_8.js";
import { S as Ko } from "./WebhookSettings-ufiGTmbG.js";
import { W as Il } from "./WebhookSettings-ufiGTmbG.js";
function Ke(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function as(t, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : t ? r.every((o) => typeof o == "string") : r.every((o) => Number.isSafeInteger(o)) : !1;
}
function Yo(t) {
  if (typeof t != "function")
    throw new Error("function expected");
  return !0;
}
function Ye(t, r) {
  if (typeof r != "string")
    throw new Error(`${t}: string expected`);
  return !0;
}
function Le(t) {
  if (!Number.isSafeInteger(t))
    throw new Error(`invalid integer: ${t}`);
}
function $e(t) {
  if (!Array.isArray(t))
    throw new Error("array expected");
}
function Ge(t, r) {
  if (!as(!0, r))
    throw new Error(`${t}: array of strings expected`);
}
function is(t, r) {
  if (!as(!1, r))
    throw new Error(`${t}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function $o(...t) {
  const r = (n) => n, o = (n, l) => (c) => n(l(c)), a = t.map((n) => n.encode).reduceRight(o, r), s = t.map((n) => n.decode).reduce(o, r);
  return { encode: a, decode: s };
}
// @__NO_SIDE_EFFECTS__
function Go(t) {
  const r = typeof t == "string" ? t.split("") : t, o = r.length;
  Ge("alphabet", r);
  const a = new Map(r.map((s, n) => [s, n]));
  return {
    encode: (s) => ($e(s), s.map((n) => {
      if (!Number.isSafeInteger(n) || n < 0 || n >= o)
        throw new Error(`alphabet.encode: digit index outside alphabet "${n}". Allowed: ${t}`);
      return r[n];
    })),
    decode: (s) => ($e(s), s.map((n) => {
      Ye("alphabet.decode", n);
      const l = a.get(n);
      if (l === void 0)
        throw new Error(`Unknown letter: "${n}". Allowed: ${t}`);
      return l;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function Jo(t = "") {
  return Ye("join", t), {
    encode: (r) => (Ge("join.decode", r), r.join(t)),
    decode: (r) => (Ye("join.decode", r), r.split(t))
  };
}
// @__NO_SIDE_EFFECTS__
function Xo(t, r = "=") {
  return Le(t), Ye("padding", r), {
    encode(o) {
      for (Ge("padding.encode", o); o.length * t % 8; )
        o.push(r);
      return o;
    },
    decode(o) {
      Ge("padding.decode", o);
      let a = o.length;
      if (a * t % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; a > 0 && o[a - 1] === r; a--)
        if ((a - 1) * t % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return o.slice(0, a);
    }
  };
}
function _t(t, r, o) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (o < 2)
    throw new Error(`convertRadix: invalid to=${o}, base cannot be less than 2`);
  if ($e(t), !t.length)
    return [];
  let a = 0;
  const s = [], n = Array.from(t, (c) => {
    if (Le(c), c < 0 || c >= r)
      throw new Error(`invalid integer: ${c}`);
    return c;
  }), l = n.length;
  for (; ; ) {
    let c = 0, d = !0;
    for (let u = a; u < l; u++) {
      const m = n[u], f = r * c, g = f + m;
      if (!Number.isSafeInteger(g) || f / r !== c || g - m !== f)
        throw new Error("convertRadix: carry overflow");
      const w = g / o;
      c = g % o;
      const p = Math.floor(w);
      if (n[u] = p, !Number.isSafeInteger(p) || p * o + c !== g)
        throw new Error("convertRadix: carry overflow");
      if (d)
        p ? d = !1 : a = u;
      else continue;
    }
    if (s.push(c), d)
      break;
  }
  for (let c = 0; c < t.length - 1 && t[c] === 0; c++)
    s.push(0);
  return s.reverse();
}
const cs = (t, r) => r === 0 ? t : cs(r, t % r), Je = /* @__NO_SIDE_EFFECTS__ */ (t, r) => t + (r - cs(t, r)), dt = /* @__PURE__ */ (() => {
  let t = [];
  for (let r = 0; r < 40; r++)
    t.push(2 ** r);
  return t;
})();
function Wt(t, r, o, a) {
  if ($e(t), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (o <= 0 || o > 32)
    throw new Error(`convertRadix2: wrong to=${o}`);
  if (/* @__PURE__ */ Je(r, o) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${o} carryBits=${/* @__PURE__ */ Je(r, o)}`);
  let s = 0, n = 0;
  const l = dt[r], c = dt[o] - 1, d = [];
  for (const u of t) {
    if (Le(u), u >= l)
      throw new Error(`convertRadix2: invalid data word=${u} from=${r}`);
    if (s = s << r | u, n + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${n} from=${r}`);
    for (n += r; n >= o; n -= o)
      d.push((s >> n - o & c) >>> 0);
    const m = dt[n];
    if (m === void 0)
      throw new Error("invalid carry");
    s &= m - 1;
  }
  if (s = s << o - n & c, !a && n >= r)
    throw new Error("Excess padding");
  if (!a && s > 0)
    throw new Error(`Non-zero padding: ${s}`);
  return a && n > 0 && d.push(s >>> 0), d;
}
// @__NO_SIDE_EFFECTS__
function Zo(t) {
  Le(t);
  const r = 2 ** 8;
  return {
    encode: (o) => {
      if (!Ke(o))
        throw new Error("radix.encode input should be Uint8Array");
      return _t(Array.from(o), r, t);
    },
    decode: (o) => (is("radix.decode", o), Uint8Array.from(_t(o, t, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function en(t, r = !1) {
  if (Le(t), t <= 0 || t > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Je(8, t) > 32 || /* @__PURE__ */ Je(t, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (o) => {
      if (!Ke(o))
        throw new Error("radix2.encode input should be Uint8Array");
      return Wt(Array.from(o), 8, t, !r);
    },
    decode: (o) => (is("radix2.decode", o), Uint8Array.from(Wt(o, t, 8, r)))
  };
}
function tn(t, r) {
  return Le(t), Yo(r), {
    encode(o) {
      if (!Ke(o))
        throw new Error("checksum.encode: input should be Uint8Array");
      const a = r(o).slice(0, t), s = new Uint8Array(o.length + t);
      return s.set(o), s.set(a, o.length), s;
    },
    decode(o) {
      if (!Ke(o))
        throw new Error("checksum.decode: input should be Uint8Array");
      const a = o.slice(0, -t), s = o.slice(-t), n = r(a).slice(0, t);
      for (let l = 0; l < t; l++)
        if (n[l] !== s[l])
          throw new Error("Invalid checksum");
      return a;
    }
  };
}
const Oe = {
  alphabet: Go,
  chain: $o,
  checksum: tn,
  convertRadix: _t,
  convertRadix2: Wt,
  radix: Zo,
  radix2: en,
  join: Jo,
  padding: Xo
};
const rn = (t) => t[0] === "あいこくしん";
function sn(t) {
  if (typeof t != "string")
    throw new TypeError("invalid mnemonic type: " + typeof t);
  return t.normalize("NFKD");
}
function on(t) {
  const r = sn(t), o = r.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: r, words: o };
}
function ls(t) {
  zo(t, 16, 20, 24, 28, 32);
}
const nn = (t) => {
  const r = 8 - t.length / 4;
  return new Uint8Array([Vo(t)[0] >> r << r]);
};
function ds(t) {
  if (!Array.isArray(t) || t.length !== 2048 || typeof t[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return t.forEach((r) => {
    if (typeof r != "string")
      throw new Error("wordlist: non-string element: " + r);
  }), Oe.chain(Oe.checksum(1, nn), Oe.radix2(11, !0), Oe.alphabet(t));
}
function Vt(t, r) {
  const { words: o } = on(t), a = ds(r).decode(o);
  return ls(a), a;
}
function us(t, r) {
  return ls(t), ds(r).encode(t).join(rn(r) ? "　" : " ");
}
function Ht(t, r) {
  try {
    Vt(t, r);
  } catch {
    return !1;
  }
  return !0;
}
const ye = `abandon
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
`), le = 12;
function an(t) {
  if (t.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${t.length}`);
  const o = us(t, ye).split(" ");
  if (o.length !== le)
    throw new Error(`Unexpected word count: expected ${le}, got ${o.length}`);
  return o;
}
function cn(t) {
  if (t.length !== le)
    throw new Error(`Invalid word count: expected ${le}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!Ht(r, ye))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const o = Vt(r, ye);
  if (o.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${o.length}`);
  return He(o);
}
function ln(t) {
  if (t.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${t.length}`);
  const o = us(t, ye).split(" ");
  if (o.length !== le)
    throw new Error(`Unexpected word count: expected ${le}, got ${o.length}`);
  return o;
}
function dn(t) {
  if (t.length !== le)
    throw new Error(`Invalid word count: expected ${le}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!Ht(r, ye))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const o = Vt(r, ye);
  if (o.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${o.length}`);
  return Gs(o);
}
function hs(t) {
  if (t.length !== le)
    return !1;
  const r = t.join(" ").toLowerCase().trim();
  return Ht(r, ye);
}
function qe(t) {
  return ye.includes(t.toLowerCase().trim());
}
function un(t, r = 5) {
  const o = t.toLowerCase().trim();
  return o.length === 0 ? [] : ye.filter((a) => a.startsWith(o)).slice(0, r);
}
function hn(t) {
  const r = [];
  for (let o = 0; o < t.length; o += 4)
    r.push(t.slice(o, o + 4));
  return r;
}
function pn(t) {
  return t.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((r) => r.trim()).filter((r) => r.length > 0);
}
function Pc({
  className: t = "",
  variant: r = "default",
  size: o = "md",
  children: a,
  menuItems: s = [],
  hideSignOut: n = !1
}) {
  const { user: l, isAuthenticated: c, isLoading: d, openLoginModal: u, logout: m } = et(), [f, g] = k(!1), [w, p] = k(-1), h = J(null), y = J(null), b = q(
    () => [...s, ...n ? [] : [{ label: "Sign out", onClick: m }]],
    [s, n, m]
  );
  _(() => {
    if (!f) return;
    const A = (L) => {
      h.current && !h.current.contains(L.target) && (g(!1), p(-1));
    }, S = (L) => {
      L.key === "Escape" && (g(!1), p(-1), y.current?.focus());
    };
    return document.addEventListener("mousedown", A), document.addEventListener("keydown", S), () => {
      document.removeEventListener("mousedown", A), document.removeEventListener("keydown", S);
    };
  }, [f]);
  const v = x(
    (A) => {
      if (!(!f || b.length === 0))
        switch (A.key) {
          case "ArrowDown":
            A.preventDefault(), p((S) => (S + 1) % b.length);
            break;
          case "ArrowUp":
            A.preventDefault(), p((S) => (S - 1 + b.length) % b.length);
            break;
          case "Home":
            A.preventDefault(), p(0);
            break;
          case "End":
            A.preventDefault(), p(b.length - 1);
            break;
          case "Enter":
          case " ":
            w >= 0 && (A.preventDefault(), b[w].onClick(), g(!1), p(-1));
            break;
        }
    },
    [f, w, b]
  ), N = x(() => {
    b.length !== 0 && (g((A) => !A), p(-1));
  }, [b.length]), E = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, P = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (d)
    return /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-button ${P[r]} ${E[o]} ${t}`,
        disabled: !0,
        children: /* @__PURE__ */ e(j, { size: "sm" })
      }
    );
  if (c && l) {
    const A = l.name || l.email || "User", S = Gr(l.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ i("div", { className: "cedros-user-menu", ref: h, onKeyDown: v, children: [
        /* @__PURE__ */ i(
          "button",
          {
            ref: y,
            type: "button",
            className: `cedros-button cedros-user-button ${E[o]} ${t}`,
            "aria-haspopup": "menu",
            "aria-expanded": f,
            "aria-label": `User menu for ${A}`,
            onClick: N,
            children: [
              S ? /* @__PURE__ */ e(
                "img",
                {
                  src: S,
                  alt: A,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ e("div", { className: "cedros-user-avatar-placeholder", children: (A[0] || "?").toUpperCase() }),
              /* @__PURE__ */ e("span", { className: "cedros-user-name", children: A })
            ]
          }
        ),
        f && /* @__PURE__ */ i("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          s.map((L, C) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${w === C ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: w === C ? 0 : -1,
              onClick: () => {
                L.onClick(), g(!1);
              },
              children: [
                L.icon && /* @__PURE__ */ e("span", { className: "cedros-dropdown-icon", children: L.icon }),
                L.label
              ]
            },
            C
          )),
          s.length > 0 && !n && /* @__PURE__ */ e("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !n && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${w === s.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: w === s.length ? 0 : -1,
              onClick: () => {
                m(), g(!1);
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
      className: `cedros-button ${P[r]} ${E[o]} ${t}`,
      onClick: u,
      children: a || "Sign in"
    }
  );
}
function Qt() {
  const { config: t } = te(), [r, o] = k(!1), [a, s] = k(!1), [n, l] = k(null), c = q(
    () => new ae({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), { checkLimit: d, getRemainingAttempts: u } = Jr({
    maxAttempts: 3,
    windowMs: 3e5
  }), m = x(
    async (p) => {
      if (!Zr(p)) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(h), h;
      }
      try {
        d();
      } catch (h) {
        const y = {
          code: "RATE_LIMITED",
          message: h instanceof Error ? h.message : "Too many attempts"
        };
        throw l(y), y;
      }
      o(!0), l(null), s(!1);
      try {
        await c.post("/forgot-password", { email: p }), s(!0);
      } catch (h) {
        const y = W(h, "Unable to send the reset email. Please try again.");
        throw l(y), y;
      } finally {
        o(!1);
      }
    },
    [c, d]
  ), f = x(
    async (p, h) => {
      o(!0), l(null), s(!1);
      try {
        await c.post("/reset-password", { token: p, newPassword: h }), s(!0);
      } catch (y) {
        const b = W(y, "Unable to reset your password. Please try again.");
        throw l(b), b;
      } finally {
        o(!1);
      }
    },
    [c]
  ), g = x(() => l(null), []), w = x(() => {
    l(null), s(!1), o(!1);
  }, []);
  return {
    forgotPassword: m,
    resetPassword: f,
    isLoading: r,
    isSuccess: a,
    error: n,
    clearError: g,
    reset: w,
    remainingAttempts: u()
  };
}
function mn(t) {
  return typeof t == "object" && t !== null && "mfaRequired" in t && t.mfaRequired === !0;
}
function fn() {
  const { config: t, _internal: r } = te(), [o, a] = k(!1), [s, n] = k(!1), [l, c] = k(null), d = q(
    () => new ae({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), { checkLimit: u, getRemainingAttempts: m } = Jr({
    maxAttempts: 3,
    windowMs: 3e5
  }), f = x(
    async (h) => {
      if (!Zr(h)) {
        const y = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw c(y), y;
      }
      try {
        u();
      } catch (y) {
        const b = {
          code: "RATE_LIMITED",
          message: y instanceof Error ? y.message : "Too many attempts"
        };
        throw c(b), b;
      }
      a(!0), c(null), n(!1);
      try {
        await d.post("/instant-link", { email: h }), n(!0);
      } catch (y) {
        const b = W(y, "Unable to send the sign-in link. Please try again.");
        throw c(b), b;
      } finally {
        a(!1);
      }
    },
    [d, u]
  ), g = x(
    async (h) => {
      if (!h || h.trim().length === 0) {
        const y = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw c(y), y;
      }
      a(!0), c(null), n(!1);
      try {
        const y = await d.post(
          "/instant-link/verify",
          {
            token: h
          }
        );
        return mn(y) || (t.callbacks?.onLoginSuccess?.(y.user, "email"), r?.handleLoginSuccess(y.user, y.tokens)), y;
      } catch (y) {
        const b = W(y, "Unable to verify the sign-in link. Please try again.");
        throw c(b), b;
      } finally {
        a(!1);
      }
    },
    [d, t.callbacks, r]
  ), w = x(() => c(null), []), p = x(() => {
    c(null), n(!1), a(!1);
  }, []);
  return {
    sendInstantLink: f,
    verifyInstantLink: g,
    isLoading: o,
    isSuccess: s,
    error: l,
    clearError: w,
    reset: p,
    remainingAttempts: m()
  };
}
const gn = {
  reset: {
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    button: "Send reset link",
    successMessage: (t) => /* @__PURE__ */ i($, { children: [
      "If an account exists for ",
      /* @__PURE__ */ e("strong", { children: t }),
      ", you will receive a password reset link shortly."
    ] })
  },
  instantLink: {
    subtitle: "Enter your email and we'll send you a sign-in link. You can change your password in your account settings once signed in.",
    button: "Send sign-in link",
    successMessage: (t) => /* @__PURE__ */ i($, { children: [
      "We sent a sign-in link to ",
      /* @__PURE__ */ e("strong", { children: t }),
      ". Click the link to sign in."
    ] })
  }
};
function wn({
  mode: t = "reset",
  onSuccess: r,
  onCancel: o,
  className: a = ""
}) {
  const [s, n] = k(""), l = Qt(), c = fn(), d = Yr(), u = t === "instantLink" ? { submit: c.sendInstantLink, isLoading: c.isLoading, isSuccess: c.isSuccess, error: c.error, clearError: c.clearError } : { submit: l.forgotPassword, isLoading: l.isLoading, isSuccess: l.isSuccess, error: l.error, clearError: l.clearError }, m = gn[t], f = async (g) => {
    g.preventDefault();
    try {
      await u.submit(s), r?.();
    } catch {
    }
  };
  return u.isSuccess ? /* @__PURE__ */ i("div", { className: `cedros-forgot-password-success ${a}`, children: [
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
    /* @__PURE__ */ e("p", { className: "cedros-success-message", children: m.successMessage(s) }),
    o && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: o,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ i("form", { className: `cedros-forgot-password-form ${a}`, onSubmit: f, children: [
    /* @__PURE__ */ i("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ e("p", { className: "cedros-form-subtitle", children: m.subtitle })
    ] }),
    /* @__PURE__ */ e(X, { error: u.error, onDismiss: u.clearError }),
    /* @__PURE__ */ i("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: d, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: d,
          type: "email",
          className: "cedros-input",
          value: s,
          onChange: (g) => n(g.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: u.isLoading
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: u.isLoading || !s,
          children: u.isLoading ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(j, { size: "sm" }),
            "Sending..."
          ] }) : m.button
        }
      ),
      o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: o,
          disabled: u.isLoading,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const yn = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Apple Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((t, r) => {
      this.callbacks.push({ resolve: t, reject: r });
    }) : (this.loading = !0, new Promise((t, r) => {
      this.callbacks.push({ resolve: t, reject: r });
      const o = document.getElementById("apple-signin-script");
      if (o) {
        window.AppleID ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = []) : o.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = [];
        });
        return;
      }
      const a = document.createElement("script");
      a.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", a.async = !0, a.defer = !0, a.id = "apple-signin-script", a.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = [];
      }, a.onerror = () => {
        this.loading = !1, a.remove();
        const s = new Error("Failed to load Apple Sign In script");
        this.callbacks.forEach((n) => n.reject(s)), this.callbacks = [];
      }, document.head.appendChild(a);
    }));
  },
  /**
   * Reset singleton state for test isolation
   * @internal - Only use in test setup/teardown
   */
  _reset() {
    this.loading = !1, this.loaded = !1, this.error = null, this.callbacks = [];
  }
};
function bn() {
  const { config: t, _internal: r } = te(), [o, a] = k(!1), [s, n] = k(!1), [l, c] = k(null), [d, u] = k(null), m = J(t), f = q(
    () => new ae({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  );
  _(() => {
    m.current = t;
  }, [t]), _(() => {
    if (!t.appleClientId)
      return;
    let h = !0;
    const y = () => {
      if (h)
        try {
          window.AppleID?.auth?.init({
            clientId: t.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), h && n(!0);
        } catch {
          h && c({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return yn.load().then(() => {
      h && y();
    }).catch(() => {
      h && c({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      h = !1;
    };
  }, [t.appleClientId]);
  const g = x(async () => {
    if (!t.appleClientId) {
      const y = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw c(y), y;
    }
    if (!s) {
      const y = {
        code: "VALIDATION_ERROR",
        message: "Apple sign-in is not ready yet. Please wait a moment and try again."
      };
      throw c(y), y;
    }
    a(!0), c(null);
    let h;
    try {
      const y = await window.AppleID.auth.signIn();
      if (h = y.authorization?.id_token, !h)
        throw new Error("No ID token received from Apple");
      const b = y.user?.name ? `${y.user.name.firstName || ""} ${y.user.name.lastName || ""}`.trim() : void 0, v = await f.post("/apple", {
        idToken: h,
        name: b || void 0
      });
      return m.current.callbacks?.onLoginSuccess?.(v.user, "apple"), r?.handleLoginSuccess(v.user, v.tokens), a(!1), v;
    } catch (y) {
      if (y.error === "popup_closed_by_user") {
        const N = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw c(N), a(!1), N;
      }
      const v = W(y, "Unable to sign in with Apple. Please try again.");
      throw v.code === "ACCOUNT_LINK_REQUIRED" && h && u(h), c(v), a(!1), v;
    }
  }, [t.appleClientId, s, f, r]), w = x(() => c(null), []), p = x(() => u(null), []);
  return {
    signIn: g,
    isLoading: o,
    isInitialized: s,
    error: l,
    clearError: w,
    pendingLinkIdToken: d,
    clearPendingLink: p
  };
}
function ps() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const t = navigator.userAgent.toLowerCase(), r = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(t) || r.includes("mac") || /macintosh/.test(t) || r === "macintel" && navigator.maxTouchPoints > 1);
}
function An({
  onSuccess: t,
  onError: r,
  className: o = "",
  variant: a = "default",
  size: s = "md",
  disabled: n = !1,
  hideOnNonApple: l = !0
}) {
  const { signIn: c, isLoading: d, isInitialized: u } = bn(), [m] = k(() => ps());
  if (l && !m)
    return null;
  const f = async () => {
    try {
      await c(), t?.();
    } catch (p) {
      const h = p instanceof Error ? p : new Error(String(p));
      r?.(h);
    }
  }, g = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[a]} ${g[s]} ${o}`,
      onClick: f,
      disabled: n || !u || d,
      "aria-label": "Sign in with Apple",
      children: [
        d ? /* @__PURE__ */ e(j, { size: "sm" }) : /* @__PURE__ */ e(
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
function oe(t, r) {
  if (!t) throw new Error(r);
}
function vn(t) {
  return t.replace(/-/g, "+").replace(/_/g, "/");
}
function Xe(t) {
  oe(typeof t == "string" && t.length > 0, "Expected base64url string");
  const r = vn(t), o = r + "=".repeat((4 - r.length % 4) % 4), a = atob(o), s = new Uint8Array(a.length);
  for (let n = 0; n < a.length; n++) s[n] = a.charCodeAt(n);
  return s.buffer;
}
function Ce(t) {
  const r = new Uint8Array(t);
  let o = "";
  for (let s = 0; s < r.length; s++) o += String.fromCharCode(r[s]);
  return btoa(o).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ms(t) {
  oe(typeof t == "object" && t !== null, "Invalid credential descriptor");
  const r = t;
  return oe(typeof r.type == "string", "Invalid credential descriptor type"), oe(typeof r.id == "string", "Invalid credential descriptor id"), {
    type: r.type,
    id: Xe(r.id),
    transports: Array.isArray(r.transports) ? r.transports : void 0
  };
}
function ut(t) {
  oe(t && typeof t == "object", "Missing creation options");
  const r = t.publicKey;
  oe(r && typeof r == "object", "Missing creation options.publicKey"), oe(typeof r.challenge == "string", "Missing creation challenge"), oe(typeof r.rp == "object" && r.rp !== null, "Missing rp"), oe(typeof r.user == "object" && r.user !== null, "Missing user");
  const o = r.rp, a = r.user;
  oe(typeof o.name == "string", "Missing rp.name"), oe(typeof a.id == "string", "Missing user.id"), oe(typeof a.name == "string", "Missing user.name"), oe(typeof a.displayName == "string", "Missing user.displayName");
  const s = Array.isArray(r.excludeCredentials) ? r.excludeCredentials.map(ms) : void 0, n = Array.isArray(r.pubKeyCredParams) ? r.pubKeyCredParams.map((c) => ({
    type: c.type,
    alg: c.alg
  })) : [], l = {
    challenge: Xe(r.challenge),
    rp: {
      name: o.name,
      id: typeof o.id == "string" ? o.id : void 0
    },
    user: {
      id: Xe(a.id),
      name: a.name,
      displayName: a.displayName
    },
    pubKeyCredParams: n,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    attestation: typeof r.attestation == "string" ? r.attestation : void 0,
    authenticatorSelection: typeof r.authenticatorSelection == "object" && r.authenticatorSelection !== null ? r.authenticatorSelection : void 0,
    excludeCredentials: s,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
  return l.hints = ["client-device"], l;
}
function nr(t) {
  oe(t && typeof t == "object", "Missing request options");
  const r = t.publicKey;
  oe(r && typeof r == "object", "Missing request options.publicKey"), oe(typeof r.challenge == "string", "Missing request challenge");
  const o = Array.isArray(r.allowCredentials) ? r.allowCredentials.map(ms) : void 0, a = {
    challenge: Xe(r.challenge),
    rpId: typeof r.rpId == "string" ? r.rpId : void 0,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    userVerification: typeof r.userVerification == "string" ? r.userVerification : void 0,
    allowCredentials: o,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
  return a.hints = ["client-device"], a;
}
function Te(t) {
  const r = Ce(t.rawId), o = t.response, s = { ...{
    clientDataJSON: Ce(o.clientDataJSON)
  } };
  if ("attestationObject" in o) {
    const n = o;
    if (s.attestationObject = Ce(n.attestationObject), typeof n.getTransports == "function")
      try {
        s.transports = n.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in o) {
    const n = o;
    s.authenticatorData = Ce(n.authenticatorData), s.signature = Ce(n.signature), n.userHandle && (s.userHandle = Ce(n.userHandle));
  }
  return {
    id: t.id,
    rawId: r,
    type: t.type,
    authenticatorAttachment: t.authenticatorAttachment ?? void 0,
    clientExtensionResults: t.getClientExtensionResults?.() ?? {},
    response: s
  };
}
function kn() {
  if (typeof window < "u") {
    const t = window.location?.hostname, r = t === "localhost" || t === "127.0.0.1" || t?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !r)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Be(t) {
  if (!(t instanceof Error)) return null;
  const r = t.name;
  return r === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : r === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : r === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function fs() {
  const { config: t, _internal: r } = te(), [o, a] = k(!1), [s, n] = k(null), l = q(
    () => new ae({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: r?.getAccessToken
    }),
    [r?.getAccessToken, t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), c = x(() => n(null), []), d = kn(), u = x(
    async (w) => {
      if (!d) {
        const p = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(p), p;
      }
      a(!0), n(null);
      try {
        const p = await l.post(
          "/webauthn/auth/options",
          { email: w?.email }
        ), h = nr(p.options), y = await navigator.credentials.get({
          publicKey: h
        });
        if (!y)
          throw new Error("Passkey authentication returned no credential");
        const b = await l.post("/webauthn/auth/verify", {
          challengeId: p.challengeId,
          credential: Te(y)
        });
        return t.callbacks?.onLoginSuccess?.(b.user, "webauthn"), r?.handleLoginSuccess(b.user, b.tokens), b;
      } catch (p) {
        const y = Be(p) ?? W(p, "Unable to sign in with passkey. Please try again.");
        throw n(y), y;
      } finally {
        a(!1);
      }
    },
    [l, t.callbacks, r, d]
  ), m = x(
    async (w) => {
      if (!d) {
        const p = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(p), p;
      }
      a(!0), n(null);
      try {
        const p = await l.post(
          "/webauthn/register/options",
          {}
        ), h = ut(p.options), y = await navigator.credentials.create({
          publicKey: h
        });
        if (!y)
          throw new Error("Passkey registration returned no credential");
        const b = await l.post("/webauthn/register/verify", {
          challengeId: p.challengeId,
          credential: Te(y),
          label: w?.label
        });
        if (!b.success)
          throw new Error("Passkey registration failed");
        return { credentialId: b.credentialId, label: b.label };
      } catch (p) {
        const y = Be(p) ?? W(p, "Unable to register passkey. Please try again.");
        throw n(y), y;
      } finally {
        a(!1);
      }
    },
    [l, d]
  ), f = x(
    async (w) => {
      if (!d) {
        const p = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(p), p;
      }
      a(!0), n(null);
      try {
        const p = await l.post(
          "/webauthn/signup/options",
          {}
        ), h = ut(p.options), y = await navigator.credentials.create({
          publicKey: h
        });
        if (!y)
          throw new Error("Passkey signup returned no credential");
        const b = await l.post("/webauthn/signup/verify", {
          challengeId: p.challengeId,
          credential: Te(y),
          email: w?.email,
          name: w?.name,
          label: w?.label
        });
        return t.callbacks?.onLoginSuccess?.(b.user, "webauthn"), r?.handleLoginSuccess(b.user, b.tokens), b;
      } catch (p) {
        const y = Be(p) ?? W(p, "Unable to sign up with passkey. Please try again.");
        throw n(y), y;
      } finally {
        a(!1);
      }
    },
    [l, t.callbacks, r, d]
  ), g = x(async () => {
    if (!d) {
      const w = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw n(w), w;
    }
    a(!0), n(null);
    try {
      const w = await l.post(
        "/webauthn/auth/options",
        {}
      ), p = nr(w.options), h = await navigator.credentials.get({
        publicKey: p
      });
      if (!h)
        throw new Error("Passkey authentication returned no credential");
      const y = await l.post("/webauthn/auth/verify", {
        challengeId: w.challengeId,
        credential: Te(h)
      });
      return t.callbacks?.onLoginSuccess?.(y.user, "webauthn"), r?.handleLoginSuccess(y.user, y.tokens), y;
    } catch (w) {
      if (w instanceof Error && (w.name === "NotAllowedError" || w.name === "InvalidStateError"))
        try {
          const b = await l.post(
            "/webauthn/signup/options",
            {}
          ), v = ut(b.options), N = await navigator.credentials.create({
            publicKey: v
          });
          if (!N)
            throw new Error("Passkey signup returned no credential");
          const E = await l.post("/webauthn/signup/verify", {
            challengeId: b.challengeId,
            credential: Te(N)
          });
          return t.callbacks?.onLoginSuccess?.(E.user, "webauthn"), r?.handleLoginSuccess(E.user, E.tokens), E;
        } catch (b) {
          const N = Be(b) ?? W(b, "Unable to create passkey. Please try again.");
          throw n(N), N;
        }
      const y = Be(w) ?? W(w, "Unable to sign in with passkey. Please try again.");
      throw n(y), y;
    } finally {
      a(!1);
    }
  }, [l, t.callbacks, r, d]);
  return {
    isSupported: d,
    isLoading: o,
    error: s,
    clearError: c,
    continueWithPasskey: g,
    authenticatePasskey: u,
    registerPasskey: m,
    signupWithPasskey: f
  };
}
function Nn({
  onSuccess: t,
  className: r = "",
  children: o,
  disabled: a
}) {
  const { continueWithPasskey: s, isLoading: n, isSupported: l } = fs(), c = a || !l || n;
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${r}`,
      onClick: async () => {
        try {
          await s(), t?.();
        } catch {
        }
      },
      disabled: c,
      "aria-disabled": c,
      children: [
        n ? /* @__PURE__ */ e(j, { size: "sm" }) : /* @__PURE__ */ e("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ e(Cn, {}) }),
        /* @__PURE__ */ e("span", { children: o ?? "Continue with Passkey" })
      ]
    }
  );
}
function Cn() {
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
function Kt({ onSuccess: t, className: r = "", defaultTab: o = "login" }) {
  const { config: a, socialButtonOrder: s } = te(), [n, l] = k(o), [c, d] = k("form"), [u, m] = k(() => or()), [f] = k(() => ps());
  _(() => {
    const P = () => m(or());
    return P(), window.addEventListener("load", P), window.addEventListener("focus", P), () => {
      window.removeEventListener("load", P), window.removeEventListener("focus", P);
    };
  }, []);
  const g = a.forms?.forgotPassword?.mode ?? (a.features?.instantLink ? "instantLink" : "reset"), w = x(
    (P) => {
      const A = Re.indexOf(n);
      let S = A;
      switch (P.key) {
        case "ArrowLeft":
        case "ArrowUp":
          S = A === 0 ? Re.length - 1 : A - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          S = A === Re.length - 1 ? 0 : A + 1;
          break;
        case "Home":
          S = 0;
          break;
        case "End":
          S = Re.length - 1;
          break;
        default:
          return;
      }
      P.preventDefault();
      const L = Re[S];
      l(L), document.getElementById(`cedros-tab-${L}`)?.focus();
    },
    [n]
  ), p = a.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, h = p.email !== !1, y = p.google !== !1 && a.googleClientId, b = p.apple !== !1 && a.appleClientId && f, v = p.solana !== !1 && u, N = p.webauthn !== !1, E = h && (y || b || v || N);
  return c === "forgotPassword" ? /* @__PURE__ */ e("div", { className: `cedros-login-form ${r}`, children: /* @__PURE__ */ e(wn, { mode: g, onCancel: () => d("form") }) }) : /* @__PURE__ */ i("div", { className: `cedros-login-form ${r}`, children: [
    (N || y || b || v) && (() => {
      const P = {
        webauthn: N ? /* @__PURE__ */ e(Nn, { onSuccess: t }) : null,
        google: y ? /* @__PURE__ */ e(co, { onSuccess: t }) : null,
        apple: b ? /* @__PURE__ */ e(An, { onSuccess: t }) : null,
        solana: v ? /* @__PURE__ */ e(lo, { onSuccess: t }) : null
      };
      return /* @__PURE__ */ e("div", { className: "cedros-social-buttons", children: (s ?? ["webauthn", "google", "apple", "solana"]).map((S) => {
        const L = P[S];
        return L ? /* @__PURE__ */ e(ro, { children: L }, S) : null;
      }) });
    })(),
    E && /* @__PURE__ */ e("div", { className: "cedros-divider", children: /* @__PURE__ */ e("span", { children: "Or continue with" }) }),
    h && /* @__PURE__ */ i($, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${n === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => l("login"),
            onKeyDown: w,
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
            onClick: () => l("register"),
            onKeyDown: w,
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
            ao,
            {
              onSuccess: t,
              onSwitchToRegister: () => l("register"),
              onForgotPassword: () => d("forgotPassword")
            }
          ) : /* @__PURE__ */ e(
            io,
            {
              onSuccess: t,
              onSwitchToLogin: () => l("login")
            }
          )
        }
      )
    ] })
  ] });
}
class En extends so {
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
  componentDidCatch(r, o) {
    this.setState({ errorInfo: o }), console.error("[Cedros Login] Error caught by ErrorBoundary:", r), console.error("[Cedros Login] Component stack:", o.componentStack), this.props.onError?.(r, o);
  }
  handleRetry = () => {
    this.setState({
      hasError: !1,
      error: null,
      errorInfo: null
    });
  };
  render() {
    const { hasError: r, error: o, errorInfo: a } = this.state, { children: s, fallback: n, showDetails: l = !1 } = this.props;
    return r ? n || /* @__PURE__ */ e("div", { className: "cedros-error-boundary", role: "alert", "aria-live": "assertive", children: /* @__PURE__ */ i("div", { className: "cedros-error-boundary-content", children: [
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
      l && o && /* @__PURE__ */ i("details", { className: "cedros-error-boundary-details", children: [
        /* @__PURE__ */ e("summary", { children: "Error details" }),
        /* @__PURE__ */ i("pre", { children: [
          o.toString(),
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
    ] }) }) : s;
  }
}
function Lc({ className: t = "", title: r = "Sign in to your account" }) {
  const { isModalOpen: o, closeModal: a } = te(), s = J(null), n = J(null), l = J(a);
  if (_(() => {
    l.current = a;
  }, [a]), _(() => {
    if (!o) return;
    n.current = document.activeElement, s.current?.focus();
    const d = (m) => {
      if (m.key === "Escape" && l.current(), m.key === "Tab" && s.current) {
        const f = s.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), g = f[0], w = f[f.length - 1];
        m.shiftKey && document.activeElement === g ? (m.preventDefault(), w?.focus()) : !m.shiftKey && document.activeElement === w && (m.preventDefault(), g?.focus());
      }
    };
    document.addEventListener("keydown", d);
    const u = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", d), document.body.style.overflow = u, n.current instanceof HTMLElement && n.current.focus();
    };
  }, [o]), !o) return null;
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
          ref: s,
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
            /* @__PURE__ */ e("div", { className: "cedros-modal-content", children: /* @__PURE__ */ e(En, { children: /* @__PURE__ */ e(Kt, { onSuccess: a }) }) })
          ]
        }
      )
    }
  );
}
function Mc({
  token: t,
  onSuccess: r,
  onLoginClick: o,
  className: a = ""
}) {
  const [s, n] = k(""), [l, c] = k(""), [d, u] = k(null), { resetPassword: m, isLoading: f, isSuccess: g, error: w, clearError: p } = Qt(), h = s === l, y = d?.isValid && h && s.length > 0, b = async (v) => {
    if (v.preventDefault(), !!y)
      try {
        await m(t, s), r?.();
      } catch {
      }
  };
  return g ? /* @__PURE__ */ i("div", { className: `cedros-reset-password-success ${a}`, children: [
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
    o && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: o,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ i("form", { className: `cedros-reset-password-form ${a}`, onSubmit: b, children: [
    /* @__PURE__ */ i("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ e("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ e(X, { error: w, onDismiss: p }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      he,
      {
        label: "New password",
        value: s,
        onChange: (v) => {
          n(v.target.value), u(rt(v.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: u,
        disabled: f,
        autoComplete: "new-password",
        error: d && !d.isValid ? Object.values(d.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      he,
      {
        label: "Confirm password",
        value: l,
        onChange: (v) => c(v.target.value),
        disabled: f,
        autoComplete: "new-password",
        error: l && !h ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: f || !y,
          children: f ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(j, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: o,
          disabled: f,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
function Ot({ org: t, size: r = "lg", className: o = "" }) {
  const a = Gr(t.logoUrl), s = r === "lg" ? "cedros-org-avatar-lg" : "", n = ["cedros-org-avatar", s, o].filter(Boolean).join(" "), l = ["cedros-org-avatar-placeholder", s, o].filter(Boolean).join(" ");
  return a ? /* @__PURE__ */ e(
    "img",
    {
      src: a,
      alt: t.name,
      className: n,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ e("div", { className: l, children: t.name[0]?.toUpperCase() || "?" });
}
function Tc({
  orgs: t,
  activeOrg: r,
  isLoading: o = !1,
  onSelect: a,
  onCreateClick: s,
  className: n = "",
  placeholder: l = "Select organization"
}) {
  const [c, d] = k(!1), u = J(null);
  _(() => {
    const w = (p) => {
      u.current && !u.current.contains(p.target) && d(!1);
    };
    return document.addEventListener("mousedown", w), () => document.removeEventListener("mousedown", w);
  }, []), _(() => {
    const w = (p) => {
      p.key === "Escape" && d(!1);
    };
    if (c)
      return document.addEventListener("keydown", w), () => document.removeEventListener("keydown", w);
  }, [c]);
  const m = x(
    (w) => {
      a(w), d(!1);
    },
    [a]
  ), f = x(() => {
    d(!1), s?.();
  }, [s]), g = x(() => {
    d((w) => !w);
  }, []);
  return o ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${n}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ e(j, { size: "sm" }),
        /* @__PURE__ */ e("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { ref: u, className: `cedros-org-selector ${n}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: g,
        "aria-haspopup": "listbox",
        "aria-expanded": c,
        children: [
          r ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(Ot, { org: r, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-name", children: r.name }),
            /* @__PURE__ */ e(ar, { role: r.membership.role })
          ] }) : /* @__PURE__ */ e("span", { className: "cedros-org-selector-placeholder", children: l }),
          /* @__PURE__ */ e(Sn, { isOpen: c })
        ]
      }
    ),
    c && /* @__PURE__ */ i("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ e("ul", { className: "cedros-org-selector-list", children: t.map((w) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${w.id === r?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => m(w.id),
          role: "option",
          "aria-selected": w.id === r?.id,
          children: [
            /* @__PURE__ */ e(Ot, { org: w, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-item-name", children: w.name }),
            /* @__PURE__ */ e(ar, { role: w.membership.role }),
            w.id === r?.id && /* @__PURE__ */ e(xn, {})
          ]
        }
      ) }, w.id)) }),
      s && /* @__PURE__ */ i($, { children: [
        /* @__PURE__ */ e("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: f,
            children: [
              /* @__PURE__ */ e(Pn, {}),
              /* @__PURE__ */ e("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function ar({ role: t }) {
  return /* @__PURE__ */ e("span", { className: `cedros-org-role cedros-org-role-${t}`, children: t });
}
function Sn({ isOpen: t }) {
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
function xn() {
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
function Pn() {
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
function Ln() {
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
function Mn() {
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
function Tn() {
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
function Bn({
  orgs: t,
  activeOrg: r,
  isLoading: o,
  onSelect: a,
  onCreateClick: s
}) {
  return o ? /* @__PURE__ */ i("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ e(j, {}),
    /* @__PURE__ */ e("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ i($, { children: [
    t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ e("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ e("ul", { className: "cedros-org-switcher-list", children: t.map((n) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${n.id === r?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => a(n.id),
        children: [
          /* @__PURE__ */ e(Ot, { org: n }),
          /* @__PURE__ */ i("div", { className: "cedros-org-switcher-item-content", children: [
            /* @__PURE__ */ e("span", { className: "cedros-org-switcher-item-name", children: n.name }),
            /* @__PURE__ */ i("span", { className: "cedros-org-switcher-item-slug", children: [
              "@",
              n.slug
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "cedros-org-switcher-item-meta", children: [
            /* @__PURE__ */ e("span", { className: `cedros-org-role cedros-org-role-${n.membership.role}`, children: n.membership.role }),
            n.isPersonal && /* @__PURE__ */ e("span", { className: "cedros-org-personal-badge", children: "Personal" })
          ] }),
          n.id === r?.id && /* @__PURE__ */ e(Mn, {})
        ]
      }
    ) }, n.id)) }),
    s && /* @__PURE__ */ i("button", { type: "button", className: "cedros-org-switcher-create", onClick: s, children: [
      /* @__PURE__ */ e(Tn, {}),
      /* @__PURE__ */ e("span", { children: "Create new organization" })
    ] })
  ] });
}
function Rn({ isLoading: t, onSubmit: r, onCancel: o }) {
  const [a, s] = k(""), [n, l] = k(""), [c, d] = k(null), u = x((f) => {
    s(f);
    const g = f.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    l(g);
  }, []), m = x(
    async (f) => {
      if (f.preventDefault(), d(null), !a.trim()) {
        d("Organization name is required");
        return;
      }
      if (!n.trim()) {
        d("Organization slug is required");
        return;
      }
      try {
        await r({ name: a.trim(), slug: n.trim() });
      } catch (g) {
        d(g.message || "Failed to create organization");
      }
    },
    [a, n, r]
  );
  return /* @__PURE__ */ i("form", { className: "cedros-org-create-form", onSubmit: m, children: [
    c && /* @__PURE__ */ e(X, { error: c }),
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
            value: n,
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
          onClick: o,
          disabled: t,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: t || !a.trim() || !n.trim(),
          children: t ? /* @__PURE__ */ e(j, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function Bc({
  isOpen: t,
  onClose: r,
  orgs: o,
  activeOrg: a,
  isLoading: s = !1,
  error: n,
  onSelect: l,
  onCreate: c,
  className: d = ""
}) {
  return t ? /* @__PURE__ */ e(
    In,
    {
      onClose: r,
      orgs: o,
      activeOrg: a,
      isLoading: s,
      error: n,
      onSelect: l,
      onCreate: c,
      className: d
    }
  ) : null;
}
function In({
  onClose: t,
  orgs: r,
  activeOrg: o,
  isLoading: a = !1,
  error: s,
  onSelect: n,
  onCreate: l,
  className: c
}) {
  const [d, u] = k("list"), m = J(null), f = J(null);
  _(() => (f.current = document.activeElement, m.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    f.current?.focus();
  }), []), _(() => {
    const h = (y) => {
      if (y.key === "Escape") {
        t();
        return;
      }
      if (y.key === "Tab" && m.current) {
        const b = m.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), v = b[0], N = b[b.length - 1];
        y.shiftKey ? document.activeElement === v && (y.preventDefault(), N?.focus()) : document.activeElement === N && (y.preventDefault(), v?.focus());
      }
    };
    return document.addEventListener("keydown", h), () => document.removeEventListener("keydown", h);
  }, [t]);
  const g = x(
    (h) => {
      h.target === h.currentTarget && t();
    },
    [t]
  ), w = x(
    (h) => {
      n(h), t();
    },
    [n, t]
  ), p = x(
    async (h) => {
      await l?.(h), t();
    },
    [l, t]
  );
  return /* @__PURE__ */ e("div", { className: "cedros-modal-backdrop", onClick: g, children: /* @__PURE__ */ i(
    "div",
    {
      ref: m,
      className: `cedros-modal cedros-org-switcher ${c}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ e("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: d === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-modal-close", onClick: t, "aria-label": "Close", children: /* @__PURE__ */ e(Ln, {}) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-modal-body", children: [
          s && /* @__PURE__ */ e(X, { error: s }),
          d === "list" ? /* @__PURE__ */ e(
            Bn,
            {
              orgs: r,
              activeOrg: o,
              isLoading: a,
              onSelect: w,
              onCreateClick: l ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ e(
            Rn,
            {
              isLoading: a,
              onSubmit: p,
              onCancel: () => u("list")
            }
          )
        ] })
      ]
    }
  ) });
}
function Dn({
  sessions: t,
  isLoading: r = !1,
  error: o,
  onRevokeAll: a,
  className: s = ""
}) {
  const [n, l] = k(!1), [c, d] = k(!1), u = J(null), m = q(() => t.filter((g) => !g.isCurrent).length, [t]), f = x(async () => {
    if (!a) return;
    const g = t.filter((p) => !p.isCurrent).length;
    if (!(g === 0 || !window.confirm(
      `Are you sure you want to sign out of ${g} other device(s)? This will log you out everywhere except this browser.`
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
  return _(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), r && t.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-session-list cedros-session-list-loading ${s}`, children: [
    /* @__PURE__ */ e(j, {}),
    /* @__PURE__ */ e("span", { children: "Loading sessions..." })
  ] }) : o ? /* @__PURE__ */ e("div", { className: `cedros-session-list ${s}`, children: /* @__PURE__ */ e(X, { error: o }) }) : t.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-session-list cedros-session-list-empty ${s}`, children: /* @__PURE__ */ e("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-session-list ${s}`, children: [
    c && /* @__PURE__ */ i("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ e(qn, {}),
      /* @__PURE__ */ e("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ e("ul", { className: "cedros-session-items", children: t.map((g) => /* @__PURE__ */ e(Un, { session: g }, g.id)) }),
    a && m > 0 && /* @__PURE__ */ e("div", { className: "cedros-session-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: f,
        disabled: n,
        children: n ? /* @__PURE__ */ i($, { children: [
          /* @__PURE__ */ e(j, { size: "sm" }),
          /* @__PURE__ */ e("span", { children: "Signing out..." })
        ] }) : `Sign out of ${m} other device${m > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function Un({ session: t }) {
  const r = Fn(t.userAgent), o = Wn(t.expiresAt);
  return /* @__PURE__ */ i("li", { className: `cedros-session-item ${t.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ e(On, { userAgent: t.userAgent }) }),
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
          _n(t.createdAt)
        ] }),
        o && /* @__PURE__ */ e("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function Fn(t) {
  if (!t)
    return { browser: "Unknown browser", os: "Unknown device" };
  let r = "Unknown browser";
  t.includes("Chrome") && !t.includes("Edg") ? r = "Chrome" : t.includes("Safari") && !t.includes("Chrome") ? r = "Safari" : t.includes("Firefox") ? r = "Firefox" : t.includes("Edg") && (r = "Edge");
  let o = "Unknown device";
  return t.includes("Windows") ? o = "Windows" : t.includes("Mac") ? o = "macOS" : t.includes("Linux") ? o = "Linux" : t.includes("iPhone") || t.includes("iPad") ? o = "iOS" : t.includes("Android") && (o = "Android"), { browser: r, os: o };
}
function _n(t) {
  const r = new Date(t), a = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60)), n = Math.floor(a / (1e3 * 60 * 60)), l = Math.floor(a / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s} minute${s > 1 ? "s" : ""} ago` : n < 24 ? `${n} hour${n > 1 ? "s" : ""} ago` : l < 7 ? `${l} day${l > 1 ? "s" : ""} ago` : r.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Wn(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = 3600 * 1e3;
  return r.getTime() - o.getTime() < a;
}
function On({ userAgent: t }) {
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
function qn() {
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
function jn({
  words: t,
  onConfirm: r,
  className: o = ""
}) {
  const [a, s] = k(!1), [n, l] = k(!1), c = J(null), d = hn(t), u = x(async () => {
    try {
      await navigator.clipboard.writeText(t.join(" ")), s(!0), c.current !== null && window.clearTimeout(c.current), c.current = window.setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [t]);
  _(() => () => {
    c.current !== null && (window.clearTimeout(c.current), c.current = null);
  }, []);
  const m = x(() => {
    n && r();
  }, [n, r]);
  return /* @__PURE__ */ i("div", { className: `cedros-recovery-phrase-display ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ e("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-recovery-grid", children: d.map((f, g) => /* @__PURE__ */ e("div", { className: "cedros-word-group", children: f.map((w, p) => {
      const h = g * 4 + p + 1;
      return /* @__PURE__ */ i("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ i("span", { className: "cedros-word-number", children: [
          h,
          "."
        ] }),
        /* @__PURE__ */ e("span", { className: "cedros-word-text", children: w })
      ] }, h);
    }) }, g)) }),
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
            checked: n,
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
          onClick: m,
          disabled: !n,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function zn({
  onSubmit: t,
  onCancel: r,
  isSubmitting: o = !1,
  error: a,
  className: s = ""
}) {
  const [n, l] = k(Array(le).fill("")), [c, d] = k(null), [u, m] = k([]), [f, g] = k(null), w = Yr(), p = J(null), h = x(
    (A, S) => {
      const L = [...n];
      if (L[A] = S.toLowerCase().trim(), l(L), S.length > 0) {
        const C = un(S, 5);
        m(C);
      } else
        m([]);
      g(null);
    },
    [n]
  ), y = x((A) => {
    d(A), m([]);
  }, []), b = x(
    (A) => {
      const S = n[A];
      S && !qe(S) && g(`Word ${A + 1} is not in the wordlist`), p.current !== null && window.clearTimeout(p.current), p.current = window.setTimeout(() => {
        c === A && m([]);
      }, 200);
    },
    [n, c]
  );
  _(() => () => {
    p.current !== null && (window.clearTimeout(p.current), p.current = null);
  }, []);
  const v = x(
    (A) => {
      if (c !== null) {
        const S = [...n];
        S[c] = A, l(S), m([]), document.querySelector(
          `[data-word-index="${c + 1}"]`
        )?.focus();
      }
    },
    [c, n]
  ), N = x((A) => {
    const S = A.clipboardData.getData("text"), L = pn(S);
    L.length === le && (A.preventDefault(), l(L), g(null));
  }, []), E = x(
    (A) => {
      if (A.preventDefault(), n.filter((C) => !C).length > 0) {
        g(`Please enter all ${le} words`);
        return;
      }
      const L = n.map((C, B) => ({ word: C, index: B + 1 })).filter(({ word: C }) => !qe(C));
      if (L.length > 0) {
        g(`Invalid words: ${L.map((C) => `#${C.index}`).join(", ")}`);
        return;
      }
      if (!hs(n)) {
        g("Invalid recovery phrase - please check your words");
        return;
      }
      t(n);
    },
    [n, t]
  ), P = a || f;
  return /* @__PURE__ */ i(
    "form",
    {
      className: `cedros-recovery-phrase-input ${s}`,
      onSubmit: E,
      onPaste: N,
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ e("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-word-inputs", children: Array.from({ length: le }, (A, S) => /* @__PURE__ */ i("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ i("label", { className: "cedros-word-label", children: [
            S + 1,
            "."
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${n[S] && !qe(n[S]) ? "cedros-word-invalid" : n[S] && qe(n[S]) ? "cedros-word-valid" : ""}`,
              value: n[S],
              onChange: (L) => h(S, L.target.value),
              onFocus: () => y(S),
              onBlur: () => b(S),
              "data-word-index": S,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: o,
              "aria-label": `Word ${S + 1}`
            }
          )
        ] }, S)) }),
        c !== null && u.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-suggestions", role: "listbox", id: `${w}-suggestions`, children: u.map((A) => /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => v(A),
            role: "option",
            children: A
          },
          A
        )) }),
        P && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: P }),
        /* @__PURE__ */ i("div", { className: "cedros-recovery-input-actions", children: [
          r && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-secondary",
              onClick: r,
              disabled: o,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "submit",
              className: "cedros-button cedros-button-primary",
              disabled: o,
              children: o ? "Recovering..." : "Recover Wallet"
            }
          )
        ] })
      ]
    }
  );
}
function Rc({ capabilities: t, className: r = "" }) {
  if (t.allSupported)
    return null;
  const o = Js(t), a = Xs();
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
    /* @__PURE__ */ e("p", { className: "cedros-warning-message", children: o }),
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
const Vn = ["share_c_only", "full_seed", "none"];
function Hn(t) {
  return t && Vn.includes(t) ? t : "share_c_only";
}
const Qn = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function gs() {
  const t = ve(), [r, o] = k(null), [a, s] = k(!!t), [n, l] = k(null), c = q(() => t ? new ae({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts
  }) : null, [t]), d = x(async () => {
    if (c) {
      s(!0), l(null);
      try {
        const u = await c.get("/discovery");
        u.wallet ? o({
          enabled: u.wallet.enabled,
          recoveryMode: Hn(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : o({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const m = u instanceof Error ? u.message : "Failed to fetch wallet config";
        l(m), o({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        s(!1);
      }
    }
  }, [c]);
  return _(() => {
    c && d();
  }, [c, d]), t ? {
    walletEnabled: r?.enabled ?? !1,
    recoveryMode: r?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: r?.unlockTtlSeconds ?? 900,
    isLoading: a,
    error: n,
    refetch: d
  } : Qn;
}
function Kn() {
  const { user: t } = te(), { enroll: r } = Pe(), { recoveryMode: o } = gs(), [a, s] = k({ step: "idle" }), [n, l] = k(!1), c = J([]), d = x(() => {
    qr(...c.current), c.current = [];
  }, []);
  _(() => () => {
    d();
  }, [d]);
  const u = x(
    async (p, h, y, b) => {
      s({ step: "generating_seed" });
      const v = Zs();
      c.current.push(v), s({ step: "splitting_shares" });
      const { shareA: N, shareB: E, shareC: P } = rs(v);
      c.current.push(N, E, P), s({ step: "encrypting_shares" });
      const A = await jr(N, zr(h)), S = ss(v), L = os(S);
      s({ step: "uploading" });
      const C = {
        solanaPubkey: L,
        shareAAuthMethod: p,
        shareACiphertext: A.ciphertext,
        shareANonce: A.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: we(E)
      };
      if (p === "password") {
        if (!y) throw new Error("KDF salt required for password method");
        C.shareAKdfSalt = we(y), C.shareAKdfParams = Qe;
      }
      if (p === "passkey" && b && (C.prfSalt = b), await r(C), o === "none")
        d(), s({
          step: "complete",
          solanaPubkey: L
        });
      else {
        const B = o === "full_seed" ? ln(v) : an(He(P));
        s({
          step: "showing_recovery",
          recoveryPhrase: B,
          solanaPubkey: L
        });
      }
    },
    [r, o, d]
  ), m = x(
    async (p) => {
      if (!t) {
        s({ step: "error", error: "User not authenticated" });
        return;
      }
      l(!0), d();
      try {
        const h = Vr(), y = await ns(p, h, Qe);
        c.current.push(y), await u("password", y, h);
      } catch (h) {
        s({
          step: "error",
          error: h instanceof Error ? h.message : "Enrollment failed"
        });
      } finally {
        l(!1);
      }
    },
    [t, d, u]
  ), f = x(async () => {
    if (!t) {
      s({ step: "error", error: "User not authenticated" });
      return;
    }
    l(!0), d();
    try {
      const p = Hr(), h = we(p);
      s({ step: "registering_passkey" });
      let y;
      try {
        const v = new TextEncoder().encode(t.id), N = t.name ?? t.email ?? "User", E = t.email ?? t.id;
        y = (await eo(
          v,
          E,
          N,
          p
        )).prfOutput;
      } catch (v) {
        if (v?.name !== "InvalidStateError")
          throw v;
        y = (await zt(h)).prfOutput;
      }
      c.current.push(y);
      const b = await Qr(y, p);
      c.current.push(b), await u("passkey", b, void 0, h);
    } catch (p) {
      s({
        step: "error",
        error: p instanceof Error ? p.message : "Enrollment failed"
      });
    } finally {
      l(!1);
    }
  }, [t, d, u]), g = x(() => {
    const p = a.solanaPubkey;
    d(), s({
      step: "complete",
      solanaPubkey: p
    });
  }, [a.solanaPubkey, d]), w = x(() => {
    d(), s({ step: "idle" }), l(!1);
  }, [d]);
  return {
    state: a,
    startEnrollmentWithPassword: m,
    startEnrollmentWithPasskey: f,
    confirmRecoveryPhrase: g,
    cancel: w,
    isEnrolling: n
  };
}
function Yn({
  onComplete: t,
  onCancel: r,
  className: o = "",
  forceAuthMethod: a
}) {
  const { user: s } = te(), {
    state: n,
    startEnrollmentWithPassword: l,
    startEnrollmentWithPasskey: c,
    confirmRecoveryPhrase: d,
    cancel: u,
    isEnrolling: m
  } = Kn(), f = () => a || "password", [g, w] = k(f), [p, h] = k(""), [y, b] = k(""), [v, N] = k(null);
  _(() => {
    w(f());
  }, [s?.id, a]);
  const E = x(
    async (L) => {
      if (L.preventDefault(), p !== y) {
        N("Passwords do not match");
        return;
      }
      const C = rt(p);
      if (!C.isValid) {
        const B = Object.values(C.errors)[0];
        N(B ?? "Password does not meet requirements");
        return;
      }
      N(null), await l(p);
    },
    [p, y, l]
  ), P = x(async () => {
    await c();
  }, [c]), A = x(() => {
    d(), n.solanaPubkey && t?.(n.solanaPubkey);
  }, [d, n.solanaPubkey, t]), S = x(() => {
    u(), r?.();
  }, [u, r]);
  return n.step === "generating_seed" || n.step === "splitting_shares" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ e("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ e("p", { children: "Generating secure wallet..." })
  ] }) }) : n.step === "encrypting_shares" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ e("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ e("p", { children: "Encrypting wallet shares..." })
  ] }) }) : n.step === "registering_passkey" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, "aria-busy": "true", children: /* @__PURE__ */ e("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: /* @__PURE__ */ i("div", { className: "cedros-passkey-prompt", children: [
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
  ] }) }) }) : n.step === "uploading" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ e("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ e("p", { children: "Saving wallet..." })
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ e(jn, { words: n.recoveryPhrase, onConfirm: A }) }) : n.step === "complete" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-complete", children: [
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
      n.solanaPubkey
    ] }),
    /* @__PURE__ */ e("p", { children: "Your non-custodial Solana wallet is ready to use." })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-error", children: [
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
    /* @__PURE__ */ e("p", { className: "cedros-error-message", children: n.error }),
    /* @__PURE__ */ i("div", { className: "cedros-error-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: S,
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
  ] }) }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-enrollment ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-enrollment-header", children: [
      /* @__PURE__ */ e("h2", { children: "Create Wallet" }),
      /* @__PURE__ */ i("p", { children: [
        "Secure your wallet with a ",
        g === "passkey" ? "passkey" : "password",
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
            checked: g === "password",
            onChange: () => w("password"),
            disabled: m
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
            checked: g === "passkey",
            onChange: () => w("passkey"),
            disabled: m
          }
        ),
        /* @__PURE__ */ e("span", { children: "Passkey" })
      ] })
    ] }),
    g === "password" && /* @__PURE__ */ i("form", { onSubmit: E, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ e(
        he,
        {
          label: "Password",
          value: p,
          onChange: (L) => h(L.target.value),
          showStrengthMeter: !0,
          disabled: m,
          required: !0,
          minLength: 8,
          placeholder: "Enter a strong password"
        }
      ),
      /* @__PURE__ */ e(
        he,
        {
          label: "Confirm Password",
          value: y,
          onChange: (L) => b(L.target.value),
          error: v ?? void 0,
          disabled: m,
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
            onClick: S,
            disabled: m,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: m || !p || !y,
            children: m ? "Creating..." : "Continue"
          }
        )
      ] })
    ] }),
    g === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-enrollment-form", children: [
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
            onClick: S,
            disabled: m,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: P,
            disabled: m,
            children: m ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] })
  ] });
}
function $n() {
  const { user: t } = te(), { signTransaction: r } = Pe(), [o, a] = k(!1), [s, n] = k(null), l = x(
    async (d, u) => {
      if (!t) {
        const m = "User not authenticated";
        throw n(m), new Error(m);
      }
      a(!0), n(null);
      try {
        const m = {
          transaction: we(d),
          ...u ? { credential: to(u) } : {}
        }, f = await r(m);
        return Kr(f.signature);
      } catch (m) {
        const f = m instanceof Error ? m.message : "Signing failed";
        throw n(f), m;
      } finally {
        a(!1);
      }
    },
    [t, r]
  ), c = x(() => n(null), []);
  return {
    signTransaction: l,
    isSigning: o,
    error: s,
    clearError: c
  };
}
function Gn() {
  const { getMaterial: t } = Pe(), [r, o] = k(!1), [a, s] = k(null), n = x(async () => {
    o(!0), s(null);
    try {
      const c = await t();
      if (!c)
        throw new Error("No wallet enrolled");
      if (c.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!c.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const d = await zt(c.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: we(d.prfOutput)
        };
      } finally {
        d.prfOutput.fill(0);
      }
    } catch (c) {
      const d = c instanceof Error ? c.message : "Passkey authentication failed";
      return s(d), null;
    } finally {
      o(!1);
    }
  }, [t]), l = x(() => s(null), []);
  return {
    getPasskeyCredential: n,
    isAuthenticating: r,
    error: a,
    clearError: l
  };
}
function Jn({
  mode: t,
  isLoading: r = !1,
  error: o,
  onPrompt: a,
  onRetry: s,
  onCancel: n,
  title: l,
  description: c,
  className: d = ""
}) {
  const u = x(() => {
    r || a?.();
  }, [r, a]), m = x(() => {
    s?.();
  }, [s]), f = t === "register" ? "Set Up Passkey" : "Verify with Passkey", g = t === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ i("div", { className: `cedros-passkey-prompt ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-passkey-icon", children: r ? /* @__PURE__ */ e(Zn, {}) : o ? /* @__PURE__ */ e(ea, {}) : /* @__PURE__ */ e(Xn, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-passkey-title", children: l ?? f }),
    /* @__PURE__ */ e("p", { className: "cedros-passkey-description", children: c ?? g }),
    o && /* @__PURE__ */ e("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ e("p", { children: o }) }),
    /* @__PURE__ */ e("div", { className: "cedros-passkey-actions", children: o ? /* @__PURE__ */ i($, { children: [
      s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: m,
          children: "Try Again"
        }
      ),
      n && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: n,
          children: "Cancel"
        }
      )
    ] }) : /* @__PURE__ */ i($, { children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: u,
          disabled: r,
          children: r ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e("span", { className: "cedros-button-spinner", "aria-hidden": "true" }),
            "Waiting for passkey..."
          ] }) : t === "register" ? "Create Passkey" : "Use Passkey"
        }
      ),
      n && !r && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: n,
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
function Xn() {
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
function Zn() {
  return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ e("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function ea() {
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
function ta({
  onUnlock: t,
  onCancel: r,
  showCancel: o = !0,
  authMethod: a,
  className: s = ""
}) {
  te();
  const { unlock: n, getMaterial: l, isLoading: c } = Pe(), { getPasskeyCredential: d, isAuthenticating: u } = Gn(), [m, f] = k("idle"), [g, w] = k(a ?? null), [p, h] = k(""), [y, b] = k(null);
  _(() => {
    a !== void 0 && w(a);
  }, [a]);
  const v = g === "password", N = g === "passkey", E = x(async () => {
    if (f("credential"), b(null), !g)
      try {
        const T = await l();
        T ? w(T.shareAAuthMethod) : (b("No wallet enrolled"), f("error"));
      } catch (T) {
        b(T instanceof Error ? T.message : "Failed to get wallet info"), f("error");
      }
  }, [g, l]), P = x(
    async (T) => {
      T.preventDefault(), b(null), f("unlocking");
      try {
        let M;
        if (v)
          M = { type: "password", password: p };
        else
          throw new Error("Invalid auth method");
        await n(M), f("unlocked"), t?.();
      } catch (M) {
        b(M instanceof Error ? M.message : "Failed to unlock wallet"), f("error");
      }
    },
    [v, p, n, t]
  ), A = x(async () => {
    b(null), f("unlocking");
    try {
      const T = await d();
      if (!T) {
        f("credential");
        return;
      }
      await n(T), f("unlocked"), t?.();
    } catch (T) {
      b(T instanceof Error ? T.message : "Failed to unlock wallet"), f("error");
    }
  }, [d, n, t]), S = x(() => {
    h(""), f("idle"), b(null), r?.();
  }, [r]), L = x(() => {
    h(""), f("credential"), b(null);
  }, []), C = c || u, B = () => {
    switch (m) {
      case "idle":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(ra, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Locked" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Unlock your wallet to sign transactions." }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary",
              onClick: E,
              children: "Unlock Wallet"
            }
          )
        ] });
      case "credential":
        return v ? /* @__PURE__ */ i("form", { className: "cedros-wallet-unlock-form", onSubmit: P, children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ e(
            he,
            {
              label: "Password",
              value: p,
              onChange: (T) => h(T.target.value),
              disabled: C,
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
                disabled: C || p.length === 0,
                children: C ? "Unlocking..." : "Unlock"
              }
            ),
            o && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: S,
                disabled: C,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ e(
            Jn,
            {
              mode: "authenticate",
              isLoading: C,
              error: y ?? void 0,
              onPrompt: A,
              onRetry: A,
              onCancel: o ? S : void 0
            }
          )
        ] }) : /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ e(j, { size: "xl" }),
          /* @__PURE__ */ e("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(j, { size: "xl" }) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(sa, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(oa, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: y ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: L,
                children: "Try Again"
              }
            ),
            o && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: S,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ e("div", { className: `cedros-wallet-unlock ${s}`, children: B() });
}
function ra() {
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
function sa() {
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
function oa() {
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
function na() {
  const { recover: t, getShareBForRecovery: r } = Pe(), { recoveryMode: o } = gs(), [a, s] = k({ step: "idle" }), [n, l] = k(!1), c = J([]), d = x(() => {
    qr(...c.current), c.current = [];
  }, []);
  _(() => () => {
    d();
  }, [d]);
  const u = x(
    async (f, g, w) => {
      l(!0), d();
      try {
        if (s({ step: "validating" }), !hs(f))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let p;
        if (o === "share_c_only") {
          const L = cn(f);
          c.current.push(L);
          const C = we(L), B = await r({ shareC: C }), T = Kr(B.shareB);
          c.current.push(T), p = Ho(He(T), He(L)), c.current.push(p);
        } else
          p = dn(f), c.current.push(p);
        const h = ss(p), y = os(h), { shareA: b, shareB: v } = rs(p);
        c.current.push(b, v), s({ step: "encrypting" });
        let N, E, P;
        if (g === "passkey") {
          const L = Hr();
          P = we(L);
          const C = await zt(P);
          c.current.push(C.prfOutput), N = await Qr(C.prfOutput, L), c.current.push(N);
        } else
          E = Vr(), N = await ns(w, E, Qe), c.current.push(N);
        const A = await jr(b, zr(N));
        s({ step: "uploading" });
        const S = {
          solanaPubkey: y,
          shareAAuthMethod: g,
          shareACiphertext: A.ciphertext,
          shareANonce: A.nonce,
          shareB: we(v)
        };
        g === "password" && (S.shareAKdfSalt = we(E), S.shareAKdfParams = Qe), g === "passkey" && (S.prfSalt = P), await t(S), d(), s({ step: "complete" });
      } catch (p) {
        d(), s({
          step: "error",
          error: p instanceof Error ? p.message : "Recovery failed"
        });
      } finally {
        l(!1);
      }
    },
    [t, r, o, d]
  ), m = x(() => {
    d(), s({ step: "idle" }), l(!1);
  }, [d]);
  return {
    state: a,
    startRecovery: u,
    cancel: m,
    isRecovering: n
  };
}
function aa({
  onComplete: t,
  onCancel: r,
  className: o = "",
  defaultAuthMethod: a = "password"
}) {
  const { state: s, startRecovery: n, cancel: l, isRecovering: c } = na(), [d, u] = k([]), [m, f] = k(!1), [g, w] = k(a), [p, h] = k(""), [y, b] = k(""), [v, N] = k(null), E = x((C) => {
    u(C), f(!0);
  }, []), P = x(
    async (C) => {
      if (C.preventDefault(), N(null), g !== "passkey") {
        if (p !== y) {
          N("Passwords do not match");
          return;
        }
        if (g === "password" && p.length < 8) {
          N("Password must be at least 8 characters");
          return;
        }
      }
      await n(d, g, p);
    },
    [d, g, p, y, n]
  ), A = x(() => {
    l(), u([]), f(!1), h(""), b(""), r?.();
  }, [l, r]), S = x(() => {
    f(!1), h(""), b("");
  }, []), L = x(() => {
    t?.();
  }, [t]);
  return s.step === "validating" || s.step === "encrypting" || s.step === "uploading" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(ia, {}) }),
    /* @__PURE__ */ i("h3", { className: "cedros-wallet-recovery-title", children: [
      s.step === "validating" && "Validating Recovery Phrase",
      s.step === "encrypting" && "Encrypting Wallet",
      s.step === "uploading" && "Saving to Server"
    ] }),
    /* @__PURE__ */ i("p", { className: "cedros-wallet-recovery-description", children: [
      s.step === "validating" && "Checking your recovery phrase...",
      s.step === "encrypting" && "Securing your wallet with new encryption...",
      s.step === "uploading" && "Uploading encrypted wallet data..."
    ] })
  ] }) }) : s.step === "complete" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-success", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(ca, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Wallet Recovered" }),
    /* @__PURE__ */ i("p", { className: "cedros-wallet-recovery-description", children: [
      "Your wallet has been successfully recovered and secured with your new",
      " ",
      g === "passkey" ? "passkey" : "password",
      "."
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: L,
        children: "Done"
      }
    ) })
  ] }) }) : s.step === "error" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(la, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: s.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: A,
        children: "Start Over"
      }
    ) })
  ] }) }) : m ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("form", { className: "cedros-wallet-recovery-credential", onSubmit: P, children: [
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
            checked: g === "password",
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
            checked: g === "passkey",
            onChange: () => w("passkey"),
            disabled: c
          }
        ),
        /* @__PURE__ */ e("span", { children: "Passkey" })
      ] })
    ] }),
    g === "password" && /* @__PURE__ */ i($, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ e("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: p,
            onChange: (C) => h(C.target.value),
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
            onChange: (C) => b(C.target.value),
            disabled: c,
            "aria-invalid": v ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        v && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: v })
      ] })
    ] }),
    g === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ e(da, {}),
      /* @__PURE__ */ e("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: S,
          disabled: c,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: c || g !== "passkey" && (p.length === 0 || y.length === 0),
          children: c ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ e(
      zn,
      {
        onSubmit: E,
        onCancel: A,
        isSubmitting: !1
      }
    )
  ] }) });
}
function ia() {
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
function ca() {
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
function la() {
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
function da() {
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
function ua({
  address: t,
  label: r = "Wallet Address",
  showCopy: o = !0,
  showExplorerLink: a = !0,
  allowReveal: s = !0,
  className: n = ""
}) {
  const l = ve(), [c, d] = k(!1), [u, m] = k(null), [f, g] = k(!1), w = J(null), p = l?.config.solana?.network ?? "mainnet-beta", h = q(() => {
    const N = `https://explorer.solana.com/address/${t}`;
    return p === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(p)}`;
  }, [t, p]), y = s && t.length > 18, b = q(() => !y || f ? t : `${t.slice(0, 8)}...${t.slice(-8)}`, [t, y, f]), v = x(async () => {
    try {
      m(null), await navigator.clipboard.writeText(t), d(!0), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        d(!1), w.current = null;
      }, 2e3);
    } catch (N) {
      d(!1), m(N instanceof Error ? N.message : "Copy failed");
    }
  }, [t]);
  return _(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []), /* @__PURE__ */ i("div", { className: `cedros-wallet-address-row ${n}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey-label", children: r }),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-actions", children: [
        y && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => g((N) => !N),
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
            href: h,
            target: "_blank",
            rel: "noreferrer",
            children: "Explorer"
          }
        ),
        o && /* @__PURE__ */ e(
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
    /* @__PURE__ */ e("code", { className: "cedros-wallet-status-pubkey-value", title: t, children: b }),
    u && /* @__PURE__ */ e("p", { className: "cedros-input-hint", role: "status", children: u })
  ] });
}
function ha({
  status: t,
  publicKey: r,
  onLock: o,
  onEnroll: a,
  onUnlock: s,
  onRecover: n,
  showActions: l = !0,
  compact: c = !1,
  className: d = ""
}) {
  const u = t !== void 0, m = tt(), f = u ? t : m.status, g = u ? r ?? null : m.solanaPubkey, w = u ? null : m.error, p = u ? () => {
  } : m.refresh, h = u ? () => {
  } : m.clearError, y = pa(f, w);
  return c ? /* @__PURE__ */ i("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${d}`, children: [
    /* @__PURE__ */ e(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${y.color}`,
        title: y.label
      }
    ),
    /* @__PURE__ */ e("span", { className: "cedros-wallet-status-label", children: y.label }),
    g && /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey", title: g, children: ma(g) })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-status ${d}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ e(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${y.color}`,
          children: /* @__PURE__ */ e(fa, { status: f })
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ e("h4", { className: "cedros-wallet-status-title", children: y.title }),
        /* @__PURE__ */ e("p", { className: "cedros-wallet-status-description", children: y.description })
      ] })
    ] }),
    g && /* @__PURE__ */ e("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ e(ua, { address: g }) }),
    w && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ e("p", { children: w }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: h,
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
      f === "enrolled_locked" && s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: s,
          children: "Unlock Wallet"
        }
      ),
      (f === "not_enrolled" || f === "error") && n && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: n,
          children: "Recover Wallet"
        }
      ),
      f === "error" && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: p,
          children: "Retry"
        }
      )
    ] })
  ] });
}
function pa(t, r) {
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
function ma(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function fa({ status: t }) {
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
function Ic({ className: t = "", showActions: r = !0 }) {
  const o = tt(), [a, s] = k("status"), n = q(() => {
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
  }, [a]), l = x(() => s("status"), []), c = x(async () => {
    s("status"), await o.refresh();
  }, [o]), d = x(async () => {
    s("status"), await o.refresh();
  }, [o]), u = x(async () => {
    s("status"), await o.refresh();
  }, [o]);
  return /* @__PURE__ */ i("div", { className: `cedros-wallet-manager ${t}`, children: [
    a !== "status" && n && /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-header-text", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-wallet-manager-title", children: n.title }),
        /* @__PURE__ */ e("p", { className: "cedros-wallet-manager-subtitle", children: n.description })
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
      ha,
      {
        onEnroll: () => s("enroll"),
        onUnlock: () => s("unlock"),
        onRecover: () => s("recover_intro"),
        showActions: r
      }
    ),
    a === "enroll" && /* @__PURE__ */ e(
      Yn,
      {
        onComplete: () => {
          c();
        },
        onCancel: l
      }
    ),
    a === "unlock" && /* @__PURE__ */ e(
      ta,
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
            onClick: () => s("recover"),
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
      aa,
      {
        onComplete: () => {
          u();
        },
        onCancel: l
      }
    )
  ] });
}
function Dc({
  showDescriptions: t = !0,
  className: r = "",
  onSave: o
}) {
  const { settings: a, isLoading: s, isUpdating: n, error: l, fetchSettings: c, updateSettings: d } = bo(), [u, m] = k({}), [f, g] = k(null), [w, p] = k(!1);
  _(() => {
    c();
  }, [c]), _(() => {
    if (w) {
      const P = setTimeout(() => p(!1), 3e3);
      return () => clearTimeout(P);
    }
  }, [w]);
  const h = x((P, A) => {
    m((S) => ({ ...S, [P]: A })), g(null), p(!1);
  }, []), y = x(async () => {
    const P = Object.entries(u).map(([A, S]) => ({
      key: A,
      value: S
    }));
    if (P.length !== 0)
      try {
        await d(P), m({}), g(null), p(!0), o?.();
      } catch (A) {
        g(A instanceof Error ? A.message : "Failed to save settings");
      }
  }, [u, d, o]), b = x(() => {
    m({}), g(null), p(!1);
  }, []), v = Object.keys(u).length > 0, N = Object.keys(u).length;
  if (s && Object.keys(a).length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
      /* @__PURE__ */ e(j, {}),
      /* @__PURE__ */ e("span", { children: "Loading settings..." })
    ] });
  if (l)
    return /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ e(X, { error: l.message }) });
  const E = Object.keys(a).sort();
  return E.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-system-settings cedros-system-settings-empty ${r}`, children: /* @__PURE__ */ e("p", { children: "No system settings found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${r}`, children: [
    f && /* @__PURE__ */ e(X, { error: f }),
    w && /* @__PURE__ */ e("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    E.map((P) => /* @__PURE__ */ e(
      ga,
      {
        category: P,
        settings: a[P],
        edits: u,
        showDescription: t,
        onChange: h
      },
      P
    )),
    /* @__PURE__ */ i("div", { className: "cedros-system-settings-actions", children: [
      v && /* @__PURE__ */ i("span", { className: "cedros-settings-change-count", children: [
        N,
        " unsaved change",
        N !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: b,
          disabled: !v || n,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: y,
          disabled: !v || n,
          children: n ? /* @__PURE__ */ e(j, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const ir = Object.keys(vo);
function ga({
  category: t,
  settings: r,
  edits: o,
  showDescription: a,
  onChange: s
}) {
  const n = Ao[t] || {
    label: t,
    description: "",
    icon: ""
  }, l = q(() => [...r].sort((c, d) => {
    const u = ir.indexOf(c.key), m = ir.indexOf(d.key);
    return (u === -1 ? 1 / 0 : u) - (m === -1 ? 1 / 0 : m);
  }), [r]);
  return /* @__PURE__ */ i("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-settings-section-icon", children: n.icon }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("h3", { className: "cedros-settings-section-title", children: n.label }),
        a && n.description && /* @__PURE__ */ e("p", { className: "cedros-settings-section-description", children: n.description })
      ] })
    ] }),
    /* @__PURE__ */ e(es, { settings: l, edits: o, onChange: s })
  ] });
}
class wa {
  client;
  constructor(r, o, a) {
    this.client = new ae({ baseUrl: r, timeoutMs: o, retryAttempts: a });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (r) {
      throw W(r, "Failed to check setup status");
    }
  }
  /**
   * Create the first admin user
   * Only works when no admin users exist
   */
  async createFirstAdmin(r) {
    try {
      return await this.client.post("/setup/admin", r);
    } catch (o) {
      throw W(o, "Failed to create admin account");
    }
  }
}
function ws() {
  const { config: t } = te(), [r, o] = k(null), [a, s] = k(!1), [n, l] = k(!1), [c, d] = k(null), u = J(0), m = q(
    () => new wa(t.serverUrl, t.requestTimeout, t.retryAttempts),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), f = J(m);
  f.current = m;
  const g = x(async () => {
    s(!0), d(null);
    const p = ++u.current;
    try {
      const h = await f.current.getStatus();
      if (p !== u.current) return;
      o(h);
    } catch (h) {
      if (p !== u.current) return;
      d(h instanceof Error ? h : new Error("Failed to check setup status"));
    } finally {
      p === u.current && s(!1);
    }
  }, []), w = x(
    async (p) => {
      l(!0), d(null);
      try {
        const h = await f.current.createFirstAdmin(p);
        return await g(), h;
      } catch (h) {
        const y = h instanceof Error ? h : new Error("Failed to create admin");
        throw d(y), y;
      } finally {
        l(!1);
      }
    },
    [g]
  );
  return {
    status: r,
    isLoading: a,
    isCreating: n,
    error: c,
    checkStatus: g,
    createAdmin: w
  };
}
const ya = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, cr = 8;
function ba(t) {
  const r = {};
  return t.email ? ya.test(t.email) || (r.email = "Invalid email format") : r.email = "Email is required", t.password ? t.password.length < cr && (r.password = `Password must be at least ${cr} characters`) : r.password = "Password is required", t.confirmPassword ? t.password !== t.confirmPassword && (r.confirmPassword = "Passwords do not match") : r.confirmPassword = "Please confirm your password", r;
}
function Aa({ onComplete: t, className: r = "" }) {
  const { status: o, isLoading: a, isCreating: s, error: n, checkStatus: l, createAdmin: c } = ws(), [d, u] = k({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [m, f] = k({}), [g, w] = k(!1);
  _(() => {
    l();
  }, [l]);
  const p = x(
    (y) => (b) => {
      u((v) => ({ ...v, [y]: b.target.value })), f((v) => ({ ...v, [y]: void 0 }));
    },
    []
  ), h = x(
    async (y) => {
      y.preventDefault();
      const b = ba(d);
      if (Object.keys(b).length > 0) {
        f(b);
        return;
      }
      try {
        await c({
          email: d.email,
          password: d.password,
          name: d.name || void 0,
          orgName: d.orgName || void 0
        }), w(!0), t?.();
      } catch {
      }
    },
    [d, c, t]
  );
  return a ? /* @__PURE__ */ e("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ e(j, {}),
    /* @__PURE__ */ e("span", { className: "cedros-setup__loading-text", children: "Checking setup status..." })
  ] }) }) : o && !o.needsSetup ? /* @__PURE__ */ e("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ e("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ i(
      "svg",
      {
        width: "48",
        height: "48",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ e("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ e("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ e("h2", { className: "cedros-setup__title", children: "Setup Complete" }),
    /* @__PURE__ */ e("p", { className: "cedros-setup__text", children: "An admin account already exists. You can now log in." })
  ] }) }) : g ? /* @__PURE__ */ e("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ e("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ i(
      "svg",
      {
        width: "48",
        height: "48",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ e("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ e("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ e("h2", { className: "cedros-setup__title", children: "Admin Account Created" }),
    /* @__PURE__ */ e("p", { className: "cedros-setup__text", children: "Your admin account has been created successfully. You can now log in with your credentials." })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__container", children: [
    /* @__PURE__ */ i("div", { className: "cedros-setup__header", children: [
      /* @__PURE__ */ e("div", { className: "cedros-setup__logo", children: /* @__PURE__ */ i(
        "svg",
        {
          width: "32",
          height: "32",
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
      ) }),
      /* @__PURE__ */ e("h1", { className: "cedros-setup__title", children: "Welcome to Cedros" }),
      /* @__PURE__ */ e("p", { className: "cedros-setup__subtitle", children: "Let's set up your admin account to get started." })
    ] }),
    /* @__PURE__ */ i("form", { className: "cedros-setup__form", onSubmit: h, children: [
      n && /* @__PURE__ */ e(X, { error: n.message }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ i("label", { htmlFor: "setup-email", className: "cedros-setup__label", children: [
          "Email Address ",
          /* @__PURE__ */ e("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "setup-email",
            type: "email",
            className: `cedros-setup__input ${m.email ? "cedros-setup__input--error" : ""}`,
            value: d.email,
            onChange: p("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: s
          }
        ),
        m.email && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: m.email })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ e("label", { htmlFor: "setup-name", className: "cedros-setup__label", children: "Display Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "setup-name",
            type: "text",
            className: "cedros-setup__input",
            value: d.name,
            onChange: p("name"),
            placeholder: "Admin",
            autoComplete: "name",
            disabled: s
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ e("label", { htmlFor: "setup-org-name", className: "cedros-setup__label", children: "Organization Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "setup-org-name",
            type: "text",
            className: "cedros-setup__input",
            value: d.orgName,
            onChange: p("orgName"),
            placeholder: "My Organization",
            disabled: s
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ i("label", { htmlFor: "setup-password", className: "cedros-setup__label", children: [
          "Password ",
          /* @__PURE__ */ e("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "setup-password",
            type: "password",
            className: `cedros-setup__input ${m.password ? "cedros-setup__input--error" : ""}`,
            value: d.password,
            onChange: p("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        m.password && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: m.password })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ i("label", { htmlFor: "setup-confirm-password", className: "cedros-setup__label", children: [
          "Confirm Password ",
          /* @__PURE__ */ e("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "setup-confirm-password",
            type: "password",
            className: `cedros-setup__input ${m.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: d.confirmPassword,
            onChange: p("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        m.confirmPassword && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: m.confirmPassword })
      ] }),
      /* @__PURE__ */ e("button", { type: "submit", className: "cedros-setup__button", disabled: s, children: s ? /* @__PURE__ */ i($, { children: [
        /* @__PURE__ */ e(j, {}),
        /* @__PURE__ */ e("span", { children: "Creating Account..." })
      ] }) : "Create Admin Account" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-setup__footer", children: [
      /* @__PURE__ */ e("p", { className: "cedros-setup__note", children: "This will be the first administrator account for your installation." }),
      o?.serverVersion && /* @__PURE__ */ i("p", { className: "cedros-setup__version", children: [
        "Server version: ",
        o.serverVersion
      ] })
    ] })
  ] }) });
}
const va = ["security", "rate_limit"];
function Uc({ className: t }) {
  return /* @__PURE__ */ e(
    Ko,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: va,
      className: t
    }
  );
}
const lr = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function ka({ className: t }) {
  const {
    settings: r,
    edits: o,
    isLoading: a,
    autosaveStatus: s,
    autosaveError: n,
    error: l,
    fetchSettings: c,
    handleChange: d,
    getEffectiveValue: u
  } = ko(), [m, f] = k("email");
  _(() => {
    c();
  }, [c]);
  const g = lr.find((E) => E.id === m), w = g?.category ?? "", h = (u("email_provider") || "custom") === "custom", y = u("email_smtp_host"), b = !h || y != null && y !== "", v = q(() => {
    const E = r[w] ?? [];
    if (m !== "email") return E;
    const P = h ? _o : Wo;
    return E.filter((A) => P.includes(A.key)).sort((A, S) => P.indexOf(A.key) - P.indexOf(S.key));
  }, [r, w, m, h]), N = (E, P) => {
    if (d(E, P), E === "email_provider" && P !== "custom") {
      const A = Oo[P];
      A && (d("email_smtp_host", A), d("email_smtp_port", "587"), d("email_smtp_tls", "true"));
    }
  };
  return a && Object.keys(r).length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${t ?? ""}`, children: [
    /* @__PURE__ */ e(j, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : l ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${t ?? ""}`, children: /* @__PURE__ */ e(X, { error: l.message }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${t ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ e(No, { status: s, error: n })
    ] }),
    m === "email" && !b && /* @__PURE__ */ e("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: lr.map((E) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${m === E.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => f(E.id),
        "aria-selected": m === E.id,
        role: "tab",
        children: E.label
      },
      E.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: v.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ i("p", { children: [
      "No settings found for ",
      g?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ e(
      es,
      {
        settings: v,
        edits: o,
        onChange: m === "email" ? N : d
      }
    ) })
  ] });
}
const ue = {
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
        /* @__PURE__ */ e("rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
        /* @__PURE__ */ e("path", { d: "M9 22v-4h6v4" }),
        /* @__PURE__ */ e("path", { d: "M8 6h.01" }),
        /* @__PURE__ */ e("path", { d: "M16 6h.01" }),
        /* @__PURE__ */ e("path", { d: "M12 6h.01" }),
        /* @__PURE__ */ e("path", { d: "M12 10h.01" }),
        /* @__PURE__ */ e("path", { d: "M12 14h.01" }),
        /* @__PURE__ */ e("path", { d: "M16 10h.01" }),
        /* @__PURE__ */ e("path", { d: "M16 14h.01" }),
        /* @__PURE__ */ e("path", { d: "M8 10h.01" }),
        /* @__PURE__ */ e("path", { d: "M8 14h.01" })
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
  ),
  // Settings sub-page icons
  key: /* @__PURE__ */ e(
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
      children: /* @__PURE__ */ e("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" })
    }
  ),
  mail: /* @__PURE__ */ i(
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
  coins: /* @__PURE__ */ i(
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
        /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6" }),
        /* @__PURE__ */ e("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
        /* @__PURE__ */ e("path", { d: "M7 6h1v4" }),
        /* @__PURE__ */ e("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
      ]
    }
  ),
  server: /* @__PURE__ */ i(
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
        /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
        /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
        /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
        /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
      ]
    }
  )
}, Na = [
  // Top-level menu items
  { id: "users", label: "Users", icon: ue.users },
  { id: "team", label: "Team", icon: ue.members },
  { id: "deposits", label: "Deposits", icon: ue.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: ue.withdrawals, requiredFeature: "credits" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: ue.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: ue.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: ue.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: ue.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-server", label: "Auth Server", icon: ue.server, group: "Configuration" }
];
function Fc({
  title: t = "Dashboard",
  sections: r = [
    "users",
    "team",
    "deposits",
    "withdrawals",
    "settings-wallet",
    "settings-auth",
    "settings-messaging",
    "settings-credits",
    "settings-server"
  ],
  defaultSection: o = "users",
  refreshInterval: a = 0,
  pageSize: s = 20,
  onSectionChange: n,
  onSettingsClick: l,
  onLogoutClick: c,
  className: d = ""
}) {
  const [u, m] = k(o), [f, g] = k(!0), { user: w, logout: p } = te(), { activeOrg: h, role: y, isLoading: b, fetchOrgs: v, hasPermission: N } = Co(), { status: E, isLoading: P, checkStatus: A } = ws(), { features: S, isLoading: L } = uo(), { canAccess: C } = ho(), B = x(
    (U) => {
      m(U), n?.(U);
    },
    [n]
  ), T = Na.filter((U) => !(!r.includes(U.id) || U.requiredFeature && !S[U.requiredFeature] || !C(U.id))), M = T.find((U) => U.id === u), R = !M && !L;
  return _(() => {
    v(), A();
  }, [v, A]), _(() => {
    R && T.length > 0 && m("users");
  }, [R, T.length]), !P && E?.needsSetup ? /* @__PURE__ */ e("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${d}`, children: /* @__PURE__ */ e(Aa, { onComplete: () => A() }) }) : (b || P || L) && !h ? /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${d}`, children: [
    /* @__PURE__ */ e(j, {}),
    /* @__PURE__ */ e("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !h ? /* @__PURE__ */ e("div", { className: `cedros-admin cedros-dashboard ${d}`, children: /* @__PURE__ */ e(X, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard ${d}`, children: [
    /* @__PURE__ */ i("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__logo", children: [
        ue.wallet,
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__logo-text", children: t })
      ] }) }),
      /* @__PURE__ */ i("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          T.filter((U) => !U.group).map((U) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === U.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => B(U.id),
              "aria-current": u === U.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: U.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: U.label })
              ]
            },
            U.id
          ))
        ] }),
        T.some((U) => U.group === "Configuration") && /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: "cedros-dashboard__nav-label cedros-dashboard__nav-label--collapsible",
              onClick: () => g(!f),
              "aria-expanded": f,
              children: [
                /* @__PURE__ */ e("span", { children: "Configuration" }),
                /* @__PURE__ */ e(
                  "span",
                  {
                    className: `cedros-dashboard__nav-chevron ${f ? "cedros-dashboard__nav-chevron--expanded" : ""}`,
                    children: ue.chevronRight
                  }
                )
              ]
            }
          ),
          f && T.filter((U) => U.group === "Configuration").map((U) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === U.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => B(U.id),
              "aria-current": u === U.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: U.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: U.label })
              ]
            },
            U.id
          ))
        ] })
      ] }),
      w && /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ e(
        Do,
        {
          name: w.name,
          email: w.email,
          picture: w.picture,
          onSettings: l,
          onLogout: c ?? p
        }
      ) })
    ] }),
    /* @__PURE__ */ i("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ e("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-root", children: t }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-sep", children: ue.chevronRight }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-current", children: M?.label })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ e(Ca, { pageSize: s, currentUserId: w?.id }),
        u === "team" && h && /* @__PURE__ */ e(
          Ea,
          {
            orgId: h.id,
            currentUserId: w?.id,
            hasPermission: N,
            role: y
          }
        ),
        u === "deposits" && /* @__PURE__ */ e(Sa, { pageSize: s, refreshInterval: a }),
        u === "withdrawals" && /* @__PURE__ */ e(xa, { pageSize: s, refreshInterval: a }),
        u === "settings-auth" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(Uo, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(Fo, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(ka, {}) }),
        u === "settings-credits" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(qo, {}) }),
        u === "settings-server" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(jo, {}) })
      ] })
    ] })
  ] });
}
function Ca({ pageSize: t, currentUserId: r }) {
  const [o, a] = k(null), { statsItems: s, isLoading: n, error: l, refresh: c } = Bo();
  return o ? /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
    Ro,
    {
      userId: o.id,
      currentUserId: r,
      onBack: () => a(null)
    }
  ) }) : /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ e(ts, { stats: s, isLoading: n, onRefresh: c }),
    l && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: l }),
    /* @__PURE__ */ e(
      Io,
      {
        pageSize: t,
        currentUserId: r,
        onUserClick: (d) => a(d)
      }
    )
  ] });
}
function Ea({ orgId: t, currentUserId: r, hasPermission: o, role: a }) {
  const [s, n] = k("members"), {
    members: l,
    isLoading: c,
    error: d,
    fetchMembers: u,
    updateMemberRole: m,
    removeMember: f
  } = po(t), {
    invites: g,
    isLoading: w,
    error: p,
    fetchInvites: h,
    createInvite: y,
    cancelInvite: b,
    resendInvite: v
  } = mo(t);
  _(() => {
    u(), h();
  }, [u, h]);
  const N = o("invite:create"), E = o("invite:cancel"), P = g.length, A = l.reduce(
    (B, T) => (B[T.role] = (B[T.role] ?? 0) + 1, B),
    {}
  ), S = A.owner ?? 0, L = A.admin ?? 0, C = A.member ?? 0;
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ e(
      ts,
      {
        stats: [
          { label: "Owners", value: S },
          { label: "Admins", value: L },
          { label: "Members", value: C },
          { label: "Pending Invites", value: P }
        ]
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "members" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => n("members"),
          "aria-selected": s === "members",
          role: "tab",
          children: "Members"
        }
      ),
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => n("invites"),
          "aria-selected": s === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            P > 0 && ` (${P})`
          ]
        }
      ),
      a === "owner" && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "permissions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => n("permissions"),
          "aria-selected": s === "permissions",
          role: "tab",
          children: "Permissions"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      s === "members" && /* @__PURE__ */ e(
        fo,
        {
          members: l,
          currentUserId: r,
          isLoading: c,
          error: d?.message,
          canManage: o("member:remove"),
          canChangeRoles: o("member:role_change"),
          onUpdateRole: m,
          onRemove: f
        }
      ),
      s === "invites" && /* @__PURE__ */ i("div", { className: "cedros-dashboard__invites", children: [
        N && /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ e(
            go,
            {
              onSubmit: y,
              isLoading: w,
              error: p?.message
            }
          )
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
          wo,
          {
            invites: g,
            isLoading: w,
            error: p?.message,
            canManage: E || N,
            onCancel: E ? b : void 0,
            onResend: N ? v : void 0
          }
        ) })
      ] }),
      s === "permissions" && a === "owner" && /* @__PURE__ */ e(yo, { userRole: a })
    ] })
  ] });
}
function Sa({ pageSize: t, refreshInterval: r }) {
  const [o, a] = k("");
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ e(So, { refreshInterval: r }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ e("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ i(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: o,
            onChange: (s) => a(s.target.value),
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
        xo,
        {
          statusFilter: o || void 0,
          pageSize: t,
          refreshInterval: r
        }
      )
    ] })
  ] });
}
function xa({ pageSize: t, refreshInterval: r }) {
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ e(Po, { refreshInterval: r }),
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ e(Lo, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(Mo, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(To, { pageSize: t, refreshInterval: r })
    ] })
  ] });
}
var Ee = {}, ht, dr;
function Pa() {
  return dr || (dr = 1, ht = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), ht;
}
var pt = {}, Ae = {}, ur;
function ke() {
  if (ur) return Ae;
  ur = 1;
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
  }, Ae.getBCHDigit = function(o) {
    let a = 0;
    for (; o !== 0; )
      a++, o >>>= 1;
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
var mt = {}, hr;
function Yt() {
  return hr || (hr = 1, (function(t) {
    t.L = { bit: 1 }, t.M = { bit: 0 }, t.Q = { bit: 3 }, t.H = { bit: 2 };
    function r(o) {
      if (typeof o != "string")
        throw new Error("Param is not a string");
      switch (o.toLowerCase()) {
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
          throw new Error("Unknown EC Level: " + o);
      }
    }
    t.isValid = function(a) {
      return a && typeof a.bit < "u" && a.bit >= 0 && a.bit < 4;
    }, t.from = function(a, s) {
      if (t.isValid(a))
        return a;
      try {
        return r(a);
      } catch {
        return s;
      }
    };
  })(mt)), mt;
}
var ft, pr;
function La() {
  if (pr) return ft;
  pr = 1;
  function t() {
    this.buffer = [], this.length = 0;
  }
  return t.prototype = {
    get: function(r) {
      const o = Math.floor(r / 8);
      return (this.buffer[o] >>> 7 - r % 8 & 1) === 1;
    },
    put: function(r, o) {
      for (let a = 0; a < o; a++)
        this.putBit((r >>> o - a - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(r) {
      const o = Math.floor(this.length / 8);
      this.buffer.length <= o && this.buffer.push(0), r && (this.buffer[o] |= 128 >>> this.length % 8), this.length++;
    }
  }, ft = t, ft;
}
var gt, mr;
function Ma() {
  if (mr) return gt;
  mr = 1;
  function t(r) {
    if (!r || r < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = r, this.data = new Uint8Array(r * r), this.reservedBit = new Uint8Array(r * r);
  }
  return t.prototype.set = function(r, o, a, s) {
    const n = r * this.size + o;
    this.data[n] = a, s && (this.reservedBit[n] = !0);
  }, t.prototype.get = function(r, o) {
    return this.data[r * this.size + o];
  }, t.prototype.xor = function(r, o, a) {
    this.data[r * this.size + o] ^= a;
  }, t.prototype.isReserved = function(r, o) {
    return this.reservedBit[r * this.size + o];
  }, gt = t, gt;
}
var wt = {}, fr;
function Ta() {
  return fr || (fr = 1, (function(t) {
    const r = ke().getSymbolSize;
    t.getRowColCoords = function(a) {
      if (a === 1) return [];
      const s = Math.floor(a / 7) + 2, n = r(a), l = n === 145 ? 26 : Math.ceil((n - 13) / (2 * s - 2)) * 2, c = [n - 7];
      for (let d = 1; d < s - 1; d++)
        c[d] = c[d - 1] - l;
      return c.push(6), c.reverse();
    }, t.getPositions = function(a) {
      const s = [], n = t.getRowColCoords(a), l = n.length;
      for (let c = 0; c < l; c++)
        for (let d = 0; d < l; d++)
          c === 0 && d === 0 || // top-left
          c === 0 && d === l - 1 || // bottom-left
          c === l - 1 && d === 0 || s.push([n[c], n[d]]);
      return s;
    };
  })(wt)), wt;
}
var yt = {}, gr;
function Ba() {
  if (gr) return yt;
  gr = 1;
  const t = ke().getSymbolSize, r = 7;
  return yt.getPositions = function(a) {
    const s = t(a);
    return [
      // top-left
      [0, 0],
      // top-right
      [s - r, 0],
      // bottom-left
      [0, s - r]
    ];
  }, yt;
}
var bt = {}, wr;
function Ra() {
  return wr || (wr = 1, (function(t) {
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
    t.isValid = function(s) {
      return s != null && s !== "" && !isNaN(s) && s >= 0 && s <= 7;
    }, t.from = function(s) {
      return t.isValid(s) ? parseInt(s, 10) : void 0;
    }, t.getPenaltyN1 = function(s) {
      const n = s.size;
      let l = 0, c = 0, d = 0, u = null, m = null;
      for (let f = 0; f < n; f++) {
        c = d = 0, u = m = null;
        for (let g = 0; g < n; g++) {
          let w = s.get(f, g);
          w === u ? c++ : (c >= 5 && (l += r.N1 + (c - 5)), u = w, c = 1), w = s.get(g, f), w === m ? d++ : (d >= 5 && (l += r.N1 + (d - 5)), m = w, d = 1);
        }
        c >= 5 && (l += r.N1 + (c - 5)), d >= 5 && (l += r.N1 + (d - 5));
      }
      return l;
    }, t.getPenaltyN2 = function(s) {
      const n = s.size;
      let l = 0;
      for (let c = 0; c < n - 1; c++)
        for (let d = 0; d < n - 1; d++) {
          const u = s.get(c, d) + s.get(c, d + 1) + s.get(c + 1, d) + s.get(c + 1, d + 1);
          (u === 4 || u === 0) && l++;
        }
      return l * r.N2;
    }, t.getPenaltyN3 = function(s) {
      const n = s.size;
      let l = 0, c = 0, d = 0;
      for (let u = 0; u < n; u++) {
        c = d = 0;
        for (let m = 0; m < n; m++)
          c = c << 1 & 2047 | s.get(u, m), m >= 10 && (c === 1488 || c === 93) && l++, d = d << 1 & 2047 | s.get(m, u), m >= 10 && (d === 1488 || d === 93) && l++;
      }
      return l * r.N3;
    }, t.getPenaltyN4 = function(s) {
      let n = 0;
      const l = s.data.length;
      for (let d = 0; d < l; d++) n += s.data[d];
      return Math.abs(Math.ceil(n * 100 / l / 5) - 10) * r.N4;
    };
    function o(a, s, n) {
      switch (a) {
        case t.Patterns.PATTERN000:
          return (s + n) % 2 === 0;
        case t.Patterns.PATTERN001:
          return s % 2 === 0;
        case t.Patterns.PATTERN010:
          return n % 3 === 0;
        case t.Patterns.PATTERN011:
          return (s + n) % 3 === 0;
        case t.Patterns.PATTERN100:
          return (Math.floor(s / 2) + Math.floor(n / 3)) % 2 === 0;
        case t.Patterns.PATTERN101:
          return s * n % 2 + s * n % 3 === 0;
        case t.Patterns.PATTERN110:
          return (s * n % 2 + s * n % 3) % 2 === 0;
        case t.Patterns.PATTERN111:
          return (s * n % 3 + (s + n) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + a);
      }
    }
    t.applyMask = function(s, n) {
      const l = n.size;
      for (let c = 0; c < l; c++)
        for (let d = 0; d < l; d++)
          n.isReserved(d, c) || n.xor(d, c, o(s, d, c));
    }, t.getBestMask = function(s, n) {
      const l = Object.keys(t.Patterns).length;
      let c = 0, d = 1 / 0;
      for (let u = 0; u < l; u++) {
        n(u), t.applyMask(u, s);
        const m = t.getPenaltyN1(s) + t.getPenaltyN2(s) + t.getPenaltyN3(s) + t.getPenaltyN4(s);
        t.applyMask(u, s), m < d && (d = m, c = u);
      }
      return c;
    };
  })(bt)), bt;
}
var je = {}, yr;
function ys() {
  if (yr) return je;
  yr = 1;
  const t = Yt(), r = [
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
  ], o = [
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
  return je.getBlocksCount = function(s, n) {
    switch (n) {
      case t.L:
        return r[(s - 1) * 4 + 0];
      case t.M:
        return r[(s - 1) * 4 + 1];
      case t.Q:
        return r[(s - 1) * 4 + 2];
      case t.H:
        return r[(s - 1) * 4 + 3];
      default:
        return;
    }
  }, je.getTotalCodewordsCount = function(s, n) {
    switch (n) {
      case t.L:
        return o[(s - 1) * 4 + 0];
      case t.M:
        return o[(s - 1) * 4 + 1];
      case t.Q:
        return o[(s - 1) * 4 + 2];
      case t.H:
        return o[(s - 1) * 4 + 3];
      default:
        return;
    }
  }, je;
}
var At = {}, Ie = {}, br;
function Ia() {
  if (br) return Ie;
  br = 1;
  const t = new Uint8Array(512), r = new Uint8Array(256);
  return (function() {
    let a = 1;
    for (let s = 0; s < 255; s++)
      t[s] = a, r[a] = s, a <<= 1, a & 256 && (a ^= 285);
    for (let s = 255; s < 512; s++)
      t[s] = t[s - 255];
  })(), Ie.log = function(a) {
    if (a < 1) throw new Error("log(" + a + ")");
    return r[a];
  }, Ie.exp = function(a) {
    return t[a];
  }, Ie.mul = function(a, s) {
    return a === 0 || s === 0 ? 0 : t[r[a] + r[s]];
  }, Ie;
}
var Ar;
function Da() {
  return Ar || (Ar = 1, (function(t) {
    const r = Ia();
    t.mul = function(a, s) {
      const n = new Uint8Array(a.length + s.length - 1);
      for (let l = 0; l < a.length; l++)
        for (let c = 0; c < s.length; c++)
          n[l + c] ^= r.mul(a[l], s[c]);
      return n;
    }, t.mod = function(a, s) {
      let n = new Uint8Array(a);
      for (; n.length - s.length >= 0; ) {
        const l = n[0];
        for (let d = 0; d < s.length; d++)
          n[d] ^= r.mul(s[d], l);
        let c = 0;
        for (; c < n.length && n[c] === 0; ) c++;
        n = n.slice(c);
      }
      return n;
    }, t.generateECPolynomial = function(a) {
      let s = new Uint8Array([1]);
      for (let n = 0; n < a; n++)
        s = t.mul(s, new Uint8Array([1, r.exp(n)]));
      return s;
    };
  })(At)), At;
}
var vt, vr;
function Ua() {
  if (vr) return vt;
  vr = 1;
  const t = Da();
  function r(o) {
    this.genPoly = void 0, this.degree = o, this.degree && this.initialize(this.degree);
  }
  return r.prototype.initialize = function(a) {
    this.degree = a, this.genPoly = t.generateECPolynomial(this.degree);
  }, r.prototype.encode = function(a) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const s = new Uint8Array(a.length + this.degree);
    s.set(a);
    const n = t.mod(s, this.genPoly), l = this.degree - n.length;
    if (l > 0) {
      const c = new Uint8Array(this.degree);
      return c.set(n, l), c;
    }
    return n;
  }, vt = r, vt;
}
var kt = {}, Nt = {}, Ct = {}, kr;
function bs() {
  return kr || (kr = 1, Ct.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), Ct;
}
var fe = {}, Nr;
function As() {
  if (Nr) return fe;
  Nr = 1;
  const t = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let o = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  o = o.replace(/u/g, "\\u");
  const a = "(?:(?![A-Z0-9 $%*+\\-./:]|" + o + `)(?:.|[\r
]))+`;
  fe.KANJI = new RegExp(o, "g"), fe.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), fe.BYTE = new RegExp(a, "g"), fe.NUMERIC = new RegExp(t, "g"), fe.ALPHANUMERIC = new RegExp(r, "g");
  const s = new RegExp("^" + o + "$"), n = new RegExp("^" + t + "$"), l = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return fe.testKanji = function(d) {
    return s.test(d);
  }, fe.testNumeric = function(d) {
    return n.test(d);
  }, fe.testAlphanumeric = function(d) {
    return l.test(d);
  }, fe;
}
var Cr;
function Ne() {
  return Cr || (Cr = 1, (function(t) {
    const r = bs(), o = As();
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
    }, t.getCharCountIndicator = function(n, l) {
      if (!n.ccBits) throw new Error("Invalid mode: " + n);
      if (!r.isValid(l))
        throw new Error("Invalid version: " + l);
      return l >= 1 && l < 10 ? n.ccBits[0] : l < 27 ? n.ccBits[1] : n.ccBits[2];
    }, t.getBestModeForData = function(n) {
      return o.testNumeric(n) ? t.NUMERIC : o.testAlphanumeric(n) ? t.ALPHANUMERIC : o.testKanji(n) ? t.KANJI : t.BYTE;
    }, t.toString = function(n) {
      if (n && n.id) return n.id;
      throw new Error("Invalid mode");
    }, t.isValid = function(n) {
      return n && n.bit && n.ccBits;
    };
    function a(s) {
      if (typeof s != "string")
        throw new Error("Param is not a string");
      switch (s.toLowerCase()) {
        case "numeric":
          return t.NUMERIC;
        case "alphanumeric":
          return t.ALPHANUMERIC;
        case "kanji":
          return t.KANJI;
        case "byte":
          return t.BYTE;
        default:
          throw new Error("Unknown mode: " + s);
      }
    }
    t.from = function(n, l) {
      if (t.isValid(n))
        return n;
      try {
        return a(n);
      } catch {
        return l;
      }
    };
  })(Nt)), Nt;
}
var Er;
function Fa() {
  return Er || (Er = 1, (function(t) {
    const r = ke(), o = ys(), a = Yt(), s = Ne(), n = bs(), l = 7973, c = r.getBCHDigit(l);
    function d(g, w, p) {
      for (let h = 1; h <= 40; h++)
        if (w <= t.getCapacity(h, p, g))
          return h;
    }
    function u(g, w) {
      return s.getCharCountIndicator(g, w) + 4;
    }
    function m(g, w) {
      let p = 0;
      return g.forEach(function(h) {
        const y = u(h.mode, w);
        p += y + h.getBitsLength();
      }), p;
    }
    function f(g, w) {
      for (let p = 1; p <= 40; p++)
        if (m(g, p) <= t.getCapacity(p, w, s.MIXED))
          return p;
    }
    t.from = function(w, p) {
      return n.isValid(w) ? parseInt(w, 10) : p;
    }, t.getCapacity = function(w, p, h) {
      if (!n.isValid(w))
        throw new Error("Invalid QR Code version");
      typeof h > "u" && (h = s.BYTE);
      const y = r.getSymbolTotalCodewords(w), b = o.getTotalCodewordsCount(w, p), v = (y - b) * 8;
      if (h === s.MIXED) return v;
      const N = v - u(h, w);
      switch (h) {
        case s.NUMERIC:
          return Math.floor(N / 10 * 3);
        case s.ALPHANUMERIC:
          return Math.floor(N / 11 * 2);
        case s.KANJI:
          return Math.floor(N / 13);
        case s.BYTE:
        default:
          return Math.floor(N / 8);
      }
    }, t.getBestVersionForData = function(w, p) {
      let h;
      const y = a.from(p, a.M);
      if (Array.isArray(w)) {
        if (w.length > 1)
          return f(w, y);
        if (w.length === 0)
          return 1;
        h = w[0];
      } else
        h = w;
      return d(h.mode, h.getLength(), y);
    }, t.getEncodedBits = function(w) {
      if (!n.isValid(w) || w < 7)
        throw new Error("Invalid QR Code version");
      let p = w << 12;
      for (; r.getBCHDigit(p) - c >= 0; )
        p ^= l << r.getBCHDigit(p) - c;
      return w << 12 | p;
    };
  })(kt)), kt;
}
var Et = {}, Sr;
function _a() {
  if (Sr) return Et;
  Sr = 1;
  const t = ke(), r = 1335, o = 21522, a = t.getBCHDigit(r);
  return Et.getEncodedBits = function(n, l) {
    const c = n.bit << 3 | l;
    let d = c << 10;
    for (; t.getBCHDigit(d) - a >= 0; )
      d ^= r << t.getBCHDigit(d) - a;
    return (c << 10 | d) ^ o;
  }, Et;
}
var St = {}, xt, xr;
function Wa() {
  if (xr) return xt;
  xr = 1;
  const t = Ne();
  function r(o) {
    this.mode = t.NUMERIC, this.data = o.toString();
  }
  return r.getBitsLength = function(a) {
    return 10 * Math.floor(a / 3) + (a % 3 ? a % 3 * 3 + 1 : 0);
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(a) {
    let s, n, l;
    for (s = 0; s + 3 <= this.data.length; s += 3)
      n = this.data.substr(s, 3), l = parseInt(n, 10), a.put(l, 10);
    const c = this.data.length - s;
    c > 0 && (n = this.data.substr(s), l = parseInt(n, 10), a.put(l, c * 3 + 1));
  }, xt = r, xt;
}
var Pt, Pr;
function Oa() {
  if (Pr) return Pt;
  Pr = 1;
  const t = Ne(), r = [
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
  function o(a) {
    this.mode = t.ALPHANUMERIC, this.data = a;
  }
  return o.getBitsLength = function(s) {
    return 11 * Math.floor(s / 2) + 6 * (s % 2);
  }, o.prototype.getLength = function() {
    return this.data.length;
  }, o.prototype.getBitsLength = function() {
    return o.getBitsLength(this.data.length);
  }, o.prototype.write = function(s) {
    let n;
    for (n = 0; n + 2 <= this.data.length; n += 2) {
      let l = r.indexOf(this.data[n]) * 45;
      l += r.indexOf(this.data[n + 1]), s.put(l, 11);
    }
    this.data.length % 2 && s.put(r.indexOf(this.data[n]), 6);
  }, Pt = o, Pt;
}
var Lt, Lr;
function qa() {
  if (Lr) return Lt;
  Lr = 1;
  const t = Ne();
  function r(o) {
    this.mode = t.BYTE, typeof o == "string" ? this.data = new TextEncoder().encode(o) : this.data = new Uint8Array(o);
  }
  return r.getBitsLength = function(a) {
    return a * 8;
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(o) {
    for (let a = 0, s = this.data.length; a < s; a++)
      o.put(this.data[a], 8);
  }, Lt = r, Lt;
}
var Mt, Mr;
function ja() {
  if (Mr) return Mt;
  Mr = 1;
  const t = Ne(), r = ke();
  function o(a) {
    this.mode = t.KANJI, this.data = a;
  }
  return o.getBitsLength = function(s) {
    return s * 13;
  }, o.prototype.getLength = function() {
    return this.data.length;
  }, o.prototype.getBitsLength = function() {
    return o.getBitsLength(this.data.length);
  }, o.prototype.write = function(a) {
    let s;
    for (s = 0; s < this.data.length; s++) {
      let n = r.toSJIS(this.data[s]);
      if (n >= 33088 && n <= 40956)
        n -= 33088;
      else if (n >= 57408 && n <= 60351)
        n -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[s] + `
Make sure your charset is UTF-8`
        );
      n = (n >>> 8 & 255) * 192 + (n & 255), a.put(n, 13);
    }
  }, Mt = o, Mt;
}
var Tt = { exports: {} }, Tr;
function za() {
  return Tr || (Tr = 1, (function(t) {
    var r = {
      single_source_shortest_paths: function(o, a, s) {
        var n = {}, l = {};
        l[a] = 0;
        var c = r.PriorityQueue.make();
        c.push(a, 0);
        for (var d, u, m, f, g, w, p, h, y; !c.empty(); ) {
          d = c.pop(), u = d.value, f = d.cost, g = o[u] || {};
          for (m in g)
            g.hasOwnProperty(m) && (w = g[m], p = f + w, h = l[m], y = typeof l[m] > "u", (y || h > p) && (l[m] = p, c.push(m, p), n[m] = u));
        }
        if (typeof s < "u" && typeof l[s] > "u") {
          var b = ["Could not find a path from ", a, " to ", s, "."].join("");
          throw new Error(b);
        }
        return n;
      },
      extract_shortest_path_from_predecessor_list: function(o, a) {
        for (var s = [], n = a; n; )
          s.push(n), o[n], n = o[n];
        return s.reverse(), s;
      },
      find_path: function(o, a, s) {
        var n = r.single_source_shortest_paths(o, a, s);
        return r.extract_shortest_path_from_predecessor_list(
          n,
          s
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(o) {
          var a = r.PriorityQueue, s = {}, n;
          o = o || {};
          for (n in a)
            a.hasOwnProperty(n) && (s[n] = a[n]);
          return s.queue = [], s.sorter = o.sorter || a.default_sorter, s;
        },
        default_sorter: function(o, a) {
          return o.cost - a.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(o, a) {
          var s = { value: o, cost: a };
          this.queue.push(s), this.queue.sort(this.sorter);
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
  })(Tt)), Tt.exports;
}
var Br;
function Va() {
  return Br || (Br = 1, (function(t) {
    const r = Ne(), o = Wa(), a = Oa(), s = qa(), n = ja(), l = As(), c = ke(), d = za();
    function u(b) {
      return unescape(encodeURIComponent(b)).length;
    }
    function m(b, v, N) {
      const E = [];
      let P;
      for (; (P = b.exec(N)) !== null; )
        E.push({
          data: P[0],
          index: P.index,
          mode: v,
          length: P[0].length
        });
      return E;
    }
    function f(b) {
      const v = m(l.NUMERIC, r.NUMERIC, b), N = m(l.ALPHANUMERIC, r.ALPHANUMERIC, b);
      let E, P;
      return c.isKanjiModeEnabled() ? (E = m(l.BYTE, r.BYTE, b), P = m(l.KANJI, r.KANJI, b)) : (E = m(l.BYTE_KANJI, r.BYTE, b), P = []), v.concat(N, E, P).sort(function(S, L) {
        return S.index - L.index;
      }).map(function(S) {
        return {
          data: S.data,
          mode: S.mode,
          length: S.length
        };
      });
    }
    function g(b, v) {
      switch (v) {
        case r.NUMERIC:
          return o.getBitsLength(b);
        case r.ALPHANUMERIC:
          return a.getBitsLength(b);
        case r.KANJI:
          return n.getBitsLength(b);
        case r.BYTE:
          return s.getBitsLength(b);
      }
    }
    function w(b) {
      return b.reduce(function(v, N) {
        const E = v.length - 1 >= 0 ? v[v.length - 1] : null;
        return E && E.mode === N.mode ? (v[v.length - 1].data += N.data, v) : (v.push(N), v);
      }, []);
    }
    function p(b) {
      const v = [];
      for (let N = 0; N < b.length; N++) {
        const E = b[N];
        switch (E.mode) {
          case r.NUMERIC:
            v.push([
              E,
              { data: E.data, mode: r.ALPHANUMERIC, length: E.length },
              { data: E.data, mode: r.BYTE, length: E.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            v.push([
              E,
              { data: E.data, mode: r.BYTE, length: E.length }
            ]);
            break;
          case r.KANJI:
            v.push([
              E,
              { data: E.data, mode: r.BYTE, length: u(E.data) }
            ]);
            break;
          case r.BYTE:
            v.push([
              { data: E.data, mode: r.BYTE, length: u(E.data) }
            ]);
        }
      }
      return v;
    }
    function h(b, v) {
      const N = {}, E = { start: {} };
      let P = ["start"];
      for (let A = 0; A < b.length; A++) {
        const S = b[A], L = [];
        for (let C = 0; C < S.length; C++) {
          const B = S[C], T = "" + A + C;
          L.push(T), N[T] = { node: B, lastCount: 0 }, E[T] = {};
          for (let M = 0; M < P.length; M++) {
            const R = P[M];
            N[R] && N[R].node.mode === B.mode ? (E[R][T] = g(N[R].lastCount + B.length, B.mode) - g(N[R].lastCount, B.mode), N[R].lastCount += B.length) : (N[R] && (N[R].lastCount = B.length), E[R][T] = g(B.length, B.mode) + 4 + r.getCharCountIndicator(B.mode, v));
          }
        }
        P = L;
      }
      for (let A = 0; A < P.length; A++)
        E[P[A]].end = 0;
      return { map: E, table: N };
    }
    function y(b, v) {
      let N;
      const E = r.getBestModeForData(b);
      if (N = r.from(v, E), N !== r.BYTE && N.bit < E.bit)
        throw new Error('"' + b + '" cannot be encoded with mode ' + r.toString(N) + `.
 Suggested mode is: ` + r.toString(E));
      switch (N === r.KANJI && !c.isKanjiModeEnabled() && (N = r.BYTE), N) {
        case r.NUMERIC:
          return new o(b);
        case r.ALPHANUMERIC:
          return new a(b);
        case r.KANJI:
          return new n(b);
        case r.BYTE:
          return new s(b);
      }
    }
    t.fromArray = function(v) {
      return v.reduce(function(N, E) {
        return typeof E == "string" ? N.push(y(E, null)) : E.data && N.push(y(E.data, E.mode)), N;
      }, []);
    }, t.fromString = function(v, N) {
      const E = f(v, c.isKanjiModeEnabled()), P = p(E), A = h(P, N), S = d.find_path(A.map, "start", "end"), L = [];
      for (let C = 1; C < S.length - 1; C++)
        L.push(A.table[S[C]].node);
      return t.fromArray(w(L));
    }, t.rawSplit = function(v) {
      return t.fromArray(
        f(v, c.isKanjiModeEnabled())
      );
    };
  })(St)), St;
}
var Rr;
function Ha() {
  if (Rr) return pt;
  Rr = 1;
  const t = ke(), r = Yt(), o = La(), a = Ma(), s = Ta(), n = Ba(), l = Ra(), c = ys(), d = Ua(), u = Fa(), m = _a(), f = Ne(), g = Va();
  function w(A, S) {
    const L = A.size, C = n.getPositions(S);
    for (let B = 0; B < C.length; B++) {
      const T = C[B][0], M = C[B][1];
      for (let R = -1; R <= 7; R++)
        if (!(T + R <= -1 || L <= T + R))
          for (let I = -1; I <= 7; I++)
            M + I <= -1 || L <= M + I || (R >= 0 && R <= 6 && (I === 0 || I === 6) || I >= 0 && I <= 6 && (R === 0 || R === 6) || R >= 2 && R <= 4 && I >= 2 && I <= 4 ? A.set(T + R, M + I, !0, !0) : A.set(T + R, M + I, !1, !0));
    }
  }
  function p(A) {
    const S = A.size;
    for (let L = 8; L < S - 8; L++) {
      const C = L % 2 === 0;
      A.set(L, 6, C, !0), A.set(6, L, C, !0);
    }
  }
  function h(A, S) {
    const L = s.getPositions(S);
    for (let C = 0; C < L.length; C++) {
      const B = L[C][0], T = L[C][1];
      for (let M = -2; M <= 2; M++)
        for (let R = -2; R <= 2; R++)
          M === -2 || M === 2 || R === -2 || R === 2 || M === 0 && R === 0 ? A.set(B + M, T + R, !0, !0) : A.set(B + M, T + R, !1, !0);
    }
  }
  function y(A, S) {
    const L = A.size, C = u.getEncodedBits(S);
    let B, T, M;
    for (let R = 0; R < 18; R++)
      B = Math.floor(R / 3), T = R % 3 + L - 8 - 3, M = (C >> R & 1) === 1, A.set(B, T, M, !0), A.set(T, B, M, !0);
  }
  function b(A, S, L) {
    const C = A.size, B = m.getEncodedBits(S, L);
    let T, M;
    for (T = 0; T < 15; T++)
      M = (B >> T & 1) === 1, T < 6 ? A.set(T, 8, M, !0) : T < 8 ? A.set(T + 1, 8, M, !0) : A.set(C - 15 + T, 8, M, !0), T < 8 ? A.set(8, C - T - 1, M, !0) : T < 9 ? A.set(8, 15 - T - 1 + 1, M, !0) : A.set(8, 15 - T - 1, M, !0);
    A.set(C - 8, 8, 1, !0);
  }
  function v(A, S) {
    const L = A.size;
    let C = -1, B = L - 1, T = 7, M = 0;
    for (let R = L - 1; R > 0; R -= 2)
      for (R === 6 && R--; ; ) {
        for (let I = 0; I < 2; I++)
          if (!A.isReserved(B, R - I)) {
            let U = !1;
            M < S.length && (U = (S[M] >>> T & 1) === 1), A.set(B, R - I, U), T--, T === -1 && (M++, T = 7);
          }
        if (B += C, B < 0 || L <= B) {
          B -= C, C = -C;
          break;
        }
      }
  }
  function N(A, S, L) {
    const C = new o();
    L.forEach(function(I) {
      C.put(I.mode.bit, 4), C.put(I.getLength(), f.getCharCountIndicator(I.mode, A)), I.write(C);
    });
    const B = t.getSymbolTotalCodewords(A), T = c.getTotalCodewordsCount(A, S), M = (B - T) * 8;
    for (C.getLengthInBits() + 4 <= M && C.put(0, 4); C.getLengthInBits() % 8 !== 0; )
      C.putBit(0);
    const R = (M - C.getLengthInBits()) / 8;
    for (let I = 0; I < R; I++)
      C.put(I % 2 ? 17 : 236, 8);
    return E(C, A, S);
  }
  function E(A, S, L) {
    const C = t.getSymbolTotalCodewords(S), B = c.getTotalCodewordsCount(S, L), T = C - B, M = c.getBlocksCount(S, L), R = C % M, I = M - R, U = Math.floor(C / M), ee = Math.floor(T / M), pe = ee + 1, re = U - ee, Q = new d(re);
    let D = 0;
    const F = new Array(M), K = new Array(M);
    let se = 0;
    const ne = new Uint8Array(A.buffer);
    for (let G = 0; G < M; G++) {
      const de = G < I ? ee : pe;
      F[G] = ne.slice(D, D + de), K[G] = Q.encode(F[G]), D += de, se = Math.max(se, de);
    }
    const ge = new Uint8Array(C);
    let me = 0, V, z;
    for (V = 0; V < se; V++)
      for (z = 0; z < M; z++)
        V < F[z].length && (ge[me++] = F[z][V]);
    for (V = 0; V < re; V++)
      for (z = 0; z < M; z++)
        ge[me++] = K[z][V];
    return ge;
  }
  function P(A, S, L, C) {
    let B;
    if (Array.isArray(A))
      B = g.fromArray(A);
    else if (typeof A == "string") {
      let U = S;
      if (!U) {
        const ee = g.rawSplit(A);
        U = u.getBestVersionForData(ee, L);
      }
      B = g.fromString(A, U || 40);
    } else
      throw new Error("Invalid data");
    const T = u.getBestVersionForData(B, L);
    if (!T)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!S)
      S = T;
    else if (S < T)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + T + `.
`
      );
    const M = N(S, L, B), R = t.getSymbolSize(S), I = new a(R);
    return w(I, S), p(I), h(I, S), b(I, L, 0), S >= 7 && y(I, S), v(I, M), isNaN(C) && (C = l.getBestMask(
      I,
      b.bind(null, I, L)
    )), l.applyMask(C, I), b(I, L, C), {
      modules: I,
      version: S,
      errorCorrectionLevel: L,
      maskPattern: C,
      segments: B
    };
  }
  return pt.create = function(S, L) {
    if (typeof S > "u" || S === "")
      throw new Error("No input text");
    let C = r.M, B, T;
    return typeof L < "u" && (C = r.from(L.errorCorrectionLevel, r.M), B = u.from(L.version), T = l.from(L.maskPattern), L.toSJISFunc && t.setToSJISFunction(L.toSJISFunc)), P(S, B, C, T);
  }, pt;
}
var Bt = {}, Rt = {}, Ir;
function vs() {
  return Ir || (Ir = 1, (function(t) {
    function r(o) {
      if (typeof o == "number" && (o = o.toString()), typeof o != "string")
        throw new Error("Color should be defined as hex string");
      let a = o.slice().replace("#", "").split("");
      if (a.length < 3 || a.length === 5 || a.length > 8)
        throw new Error("Invalid hex color: " + o);
      (a.length === 3 || a.length === 4) && (a = Array.prototype.concat.apply([], a.map(function(n) {
        return [n, n];
      }))), a.length === 6 && a.push("F", "F");
      const s = parseInt(a.join(""), 16);
      return {
        r: s >> 24 & 255,
        g: s >> 16 & 255,
        b: s >> 8 & 255,
        a: s & 255,
        hex: "#" + a.slice(0, 6).join("")
      };
    }
    t.getOptions = function(a) {
      a || (a = {}), a.color || (a.color = {});
      const s = typeof a.margin > "u" || a.margin === null || a.margin < 0 ? 4 : a.margin, n = a.width && a.width >= 21 ? a.width : void 0, l = a.scale || 4;
      return {
        width: n,
        scale: n ? 4 : l,
        margin: s,
        color: {
          dark: r(a.color.dark || "#000000ff"),
          light: r(a.color.light || "#ffffffff")
        },
        type: a.type,
        rendererOpts: a.rendererOpts || {}
      };
    }, t.getScale = function(a, s) {
      return s.width && s.width >= a + s.margin * 2 ? s.width / (a + s.margin * 2) : s.scale;
    }, t.getImageWidth = function(a, s) {
      const n = t.getScale(a, s);
      return Math.floor((a + s.margin * 2) * n);
    }, t.qrToImageData = function(a, s, n) {
      const l = s.modules.size, c = s.modules.data, d = t.getScale(l, n), u = Math.floor((l + n.margin * 2) * d), m = n.margin * d, f = [n.color.light, n.color.dark];
      for (let g = 0; g < u; g++)
        for (let w = 0; w < u; w++) {
          let p = (g * u + w) * 4, h = n.color.light;
          if (g >= m && w >= m && g < u - m && w < u - m) {
            const y = Math.floor((g - m) / d), b = Math.floor((w - m) / d);
            h = f[c[y * l + b] ? 1 : 0];
          }
          a[p++] = h.r, a[p++] = h.g, a[p++] = h.b, a[p] = h.a;
        }
    };
  })(Rt)), Rt;
}
var Dr;
function Qa() {
  return Dr || (Dr = 1, (function(t) {
    const r = vs();
    function o(s, n, l) {
      s.clearRect(0, 0, n.width, n.height), n.style || (n.style = {}), n.height = l, n.width = l, n.style.height = l + "px", n.style.width = l + "px";
    }
    function a() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    t.render = function(n, l, c) {
      let d = c, u = l;
      typeof d > "u" && (!l || !l.getContext) && (d = l, l = void 0), l || (u = a()), d = r.getOptions(d);
      const m = r.getImageWidth(n.modules.size, d), f = u.getContext("2d"), g = f.createImageData(m, m);
      return r.qrToImageData(g.data, n, d), o(f, u, m), f.putImageData(g, 0, 0), u;
    }, t.renderToDataURL = function(n, l, c) {
      let d = c;
      typeof d > "u" && (!l || !l.getContext) && (d = l, l = void 0), d || (d = {});
      const u = t.render(n, l, d), m = d.type || "image/png", f = d.rendererOpts || {};
      return u.toDataURL(m, f.quality);
    };
  })(Bt)), Bt;
}
var It = {}, Ur;
function Ka() {
  if (Ur) return It;
  Ur = 1;
  const t = vs();
  function r(s, n) {
    const l = s.a / 255, c = n + '="' + s.hex + '"';
    return l < 1 ? c + " " + n + '-opacity="' + l.toFixed(2).slice(1) + '"' : c;
  }
  function o(s, n, l) {
    let c = s + n;
    return typeof l < "u" && (c += " " + l), c;
  }
  function a(s, n, l) {
    let c = "", d = 0, u = !1, m = 0;
    for (let f = 0; f < s.length; f++) {
      const g = Math.floor(f % n), w = Math.floor(f / n);
      !g && !u && (u = !0), s[f] ? (m++, f > 0 && g > 0 && s[f - 1] || (c += u ? o("M", g + l, 0.5 + w + l) : o("m", d, 0), d = 0, u = !1), g + 1 < n && s[f + 1] || (c += o("h", m), m = 0)) : d++;
    }
    return c;
  }
  return It.render = function(n, l, c) {
    const d = t.getOptions(l), u = n.modules.size, m = n.modules.data, f = u + d.margin * 2, g = d.color.light.a ? "<path " + r(d.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", w = "<path " + r(d.color.dark, "stroke") + ' d="' + a(m, u, d.margin) + '"/>', p = 'viewBox="0 0 ' + f + " " + f + '"', y = '<svg xmlns="http://www.w3.org/2000/svg" ' + (d.width ? 'width="' + d.width + '" height="' + d.width + '" ' : "") + p + ' shape-rendering="crispEdges">' + g + w + `</svg>
`;
    return typeof c == "function" && c(null, y), y;
  }, It;
}
var Fr;
function Ya() {
  if (Fr) return Ee;
  Fr = 1;
  const t = Pa(), r = Ha(), o = Qa(), a = Ka();
  function s(n, l, c, d, u) {
    const m = [].slice.call(arguments, 1), f = m.length, g = typeof m[f - 1] == "function";
    if (!g && !t())
      throw new Error("Callback required as last argument");
    if (g) {
      if (f < 2)
        throw new Error("Too few arguments provided");
      f === 2 ? (u = c, c = l, l = d = void 0) : f === 3 && (l.getContext && typeof u > "u" ? (u = d, d = void 0) : (u = d, d = c, c = l, l = void 0));
    } else {
      if (f < 1)
        throw new Error("Too few arguments provided");
      return f === 1 ? (c = l, l = d = void 0) : f === 2 && !l.getContext && (d = c, c = l, l = void 0), new Promise(function(w, p) {
        try {
          const h = r.create(c, d);
          w(n(h, l, d));
        } catch (h) {
          p(h);
        }
      });
    }
    try {
      const w = r.create(c, d);
      u(null, n(w, l, d));
    } catch (w) {
      u(w);
    }
  }
  return Ee.create = r.create, Ee.toCanvas = s.bind(null, o.render), Ee.toDataURL = s.bind(null, o.renderToDataURL), Ee.toString = s.bind(null, function(n, l, c) {
    return a.render(n, c);
  }), Ee;
}
var $a = Ya();
const Ga = /* @__PURE__ */ Qo($a);
function Ja({ value: t, size: r = 200, alt: o = "QR code", className: a = "" }) {
  const s = J(null), [n, l] = k(null);
  return _(() => {
    !s.current || !t || Ga.toCanvas(s.current, t, {
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
  }, [t, r]), n ? /* @__PURE__ */ e(
    "div",
    {
      className: `cedros-qr-error ${a}`,
      style: { width: r, height: r },
      role: "img",
      "aria-label": o,
      children: /* @__PURE__ */ e("p", { children: "Failed to generate QR code" })
    }
  ) : /* @__PURE__ */ e(
    "canvas",
    {
      ref: s,
      className: `cedros-totp-qr-image ${a}`,
      role: "img",
      "aria-label": o,
      style: { borderRadius: "0.5rem" }
    }
  );
}
function ks() {
  const { config: t, _internal: r } = te(), [o, a] = k(null), [s, n] = k("idle"), [l, c] = k(null), [d, u] = k(!1), [m, f] = k(null), g = q(
    () => new ae({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), w = x(async () => {
    u(!0), f(null);
    try {
      const E = await g.get("/mfa/status");
      return a(E), E;
    } catch (E) {
      const P = W(E, "Unable to load two-factor authentication status. Please try again.");
      throw f(P), P;
    } finally {
      u(!1);
    }
  }, [g]), p = x(async () => {
    u(!0), f(null), n("loading");
    try {
      const E = await g.post("/mfa/setup", {});
      return c(E), n("setup"), E;
    } catch (E) {
      const P = W(E, "Unable to start two-factor setup. Please try again.");
      throw f(P), n("error"), P;
    } finally {
      u(!1);
    }
  }, [g]), h = x(
    async (E) => {
      if (!/^\d{6}$/.test(E)) {
        const P = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(P), P;
      }
      u(!0), f(null), n("verifying");
      try {
        await g.post("/mfa/enable", { code: E }), n("success");
        try {
          const P = await g.get("/mfa/status");
          a(P);
        } catch {
          a({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (P) {
        const A = W(P, "Incorrect verification code. Please check and try again.");
        throw f(A), n("error"), A;
      } finally {
        u(!1);
      }
    },
    [g]
  ), y = x(
    async (E) => {
      if (!E) {
        const P = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw f(P), P;
      }
      u(!0), f(null);
      try {
        await g.post("/mfa/disable", { password: E }), a({ enabled: !1, recoveryCodesRemaining: 0 }), c(null), n("idle");
      } catch (P) {
        const A = W(P, "Unable to disable two-factor authentication. Please try again.");
        throw f(A), A;
      } finally {
        u(!1);
      }
    },
    [g]
  ), b = x(
    async (E) => {
      if (!/^\d{6}$/.test(E)) {
        const P = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(P), P;
      }
      u(!0), f(null);
      try {
        return await g.post(
          "/mfa/recovery-codes/regenerate",
          { code: E }
        );
      } catch (P) {
        const A = W(P, "Unable to regenerate recovery codes. Please try again.");
        throw f(A), A;
      } finally {
        u(!1);
      }
    },
    [g]
  ), v = x(() => f(null), []), N = x(() => {
    f(null), c(null), n("idle"), u(!1);
  }, []);
  return {
    status: o,
    setupState: s,
    setupData: l,
    isLoading: d,
    error: m,
    getStatus: w,
    beginSetup: p,
    enableTotp: h,
    disableTotp: y,
    regenerateBackupCodes: b,
    clearError: v,
    reset: N
  };
}
function Ns({ onSuccess: t, onCancel: r, className: o = "" }) {
  const { setupState: a, setupData: s, isLoading: n, error: l, beginSetup: c, enableTotp: d, clearError: u, reset: m } = ks(), [f, g] = k("qr"), [w, p] = k(""), [h, y] = k(!1), [b, v] = k(!1), N = J(null);
  _(() => {
    a === "idle" && c().catch(() => {
    });
  }, [a, c]), _(() => {
    a === "success" && t?.();
  }, [a, t]);
  const E = async () => {
    s?.secret && (await navigator.clipboard.writeText(s.secret), y(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => y(!1), 2e3));
  }, P = async () => {
    if (s?.recoveryCodes) {
      const L = s.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(L);
    }
  }, A = async () => {
    try {
      await d(w);
    } catch {
      p("");
    }
  }, S = () => {
    m(), r?.();
  };
  return _(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), a === "loading" || a === "idle" && n ? /* @__PURE__ */ e("div", { className: `cedros-totp-setup ${o}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(j, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : a === "error" && !s ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${o}`, children: [
    /* @__PURE__ */ e(X, { error: l, onDismiss: u }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: S,
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
  ] }) : a === "success" ? /* @__PURE__ */ e("div", { className: `cedros-totp-setup ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-success", children: [
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
  ] }) }) : s ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${o}`, children: [
    f === "qr" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ e("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ e(Ja, { value: s.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ e("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ i("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ e("code", { className: "cedros-totp-secret-code", children: s.secret }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: E,
              "aria-label": "Copy secret",
              children: h ? "Copied!" : "Copy"
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
            onClick: S,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => g("backup"),
            children: "Continue"
          }
        )
      ] })
    ] }),
    f === "backup" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: s.recoveryCodes.map((L, C) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: L }, C)) }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: P,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ i("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: b,
            onChange: (L) => v(L.target.checked)
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
            onClick: () => g("qr"),
            children: "Back"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => g("verify"),
            disabled: !b,
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
          onChange: p,
          onComplete: A,
          disabled: n,
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
            onClick: () => g("backup"),
            disabled: n,
            children: "Back"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: A,
            disabled: n || w.length !== 6,
            children: n ? /* @__PURE__ */ i($, { children: [
              /* @__PURE__ */ e(j, { size: "sm" }),
              /* @__PURE__ */ e("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function Xa({ onStatusChange: t, className: r = "" }) {
  const { status: o, isLoading: a, error: s, getStatus: n, disableTotp: l, regenerateBackupCodes: c, clearError: d } = ks(), [u, m] = k("status"), [f, g] = k(""), [w, p] = k(""), [h, y] = k(null), [b, v] = k(!1), [N, E] = k(null);
  _(() => {
    n().catch(() => {
    });
  }, [n]);
  const P = x(() => {
    m("status"), t?.(!0);
  }, [t]), A = async () => {
    v(!0), E(null);
    try {
      await l(f), m("status"), g(""), t?.(!1);
    } catch (C) {
      E(C instanceof Error ? C.message : "Failed to disable 2FA"), g("");
    } finally {
      v(!1);
    }
  }, S = async () => {
    v(!0), E(null);
    try {
      const C = await c(w);
      y(C.recoveryCodes), p("");
    } catch (C) {
      E(C instanceof Error ? C.message : "Failed to regenerate codes"), p("");
    } finally {
      v(!1);
    }
  }, L = async () => {
    h && await navigator.clipboard.writeText(h.join(`
`));
  };
  return a && !o ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(j, { size: "md", label: "Loading security settings" }) }) }) : s && !o ? /* @__PURE__ */ i("div", { className: `cedros-totp-settings ${r}`, children: [
    /* @__PURE__ */ e(X, { error: s, onDismiss: d }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => n(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e(Ns, { onSuccess: P, onCancel: () => m("status") }) }) : u === "disable" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    N && /* @__PURE__ */ e("div", { className: "cedros-totp-error", children: /* @__PURE__ */ e(
      X,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => E(null)
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ e(
      he,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: f,
        onChange: (C) => g(C.target.value),
        disabled: b,
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
            m("status"), g(""), E(null);
          },
          disabled: b,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: A,
          disabled: b || f.length === 0,
          children: b ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(j, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? h ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: h.map((C, B) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: C }, B)) }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: L,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ e("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          m("status"), y(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    N && /* @__PURE__ */ e("div", { className: "cedros-totp-error", children: /* @__PURE__ */ e(
      X,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => E(null)
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ e(
      Xr,
      {
        value: w,
        onChange: p,
        onComplete: S,
        disabled: b,
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
            m("status"), p(""), E(null);
          },
          disabled: b,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: S,
          disabled: b || w.length !== 6,
          children: b ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(j, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Regenerating..." })
          ] }) : "Regenerate codes"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-totp-status-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-totp-status-info", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
        /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Add an extra layer of security to your account by requiring a verification code from your authenticator app when signing in with email and password. Other sign-in methods (Google, Apple, passkeys) use their own built-in verification." })
      ] }),
      /* @__PURE__ */ e(
        "div",
        {
          className: `cedros-totp-badge ${o?.enabled ? "cedros-totp-badge-enabled" : "cedros-totp-badge-disabled"}`,
          children: o?.enabled ? "Enabled" : "Disabled"
        }
      )
    ] }),
    o?.enabled ? /* @__PURE__ */ i("div", { className: "cedros-totp-enabled-actions", children: [
      /* @__PURE__ */ i("div", { className: "cedros-totp-description", style: { marginTop: "0.25rem" }, children: [
        "Recovery codes remaining: ",
        /* @__PURE__ */ e("strong", { children: o.recoveryCodesRemaining })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => m("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => m("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => m("setup"),
        children: "Enable two-factor authentication"
      }
    )
  ] }) });
}
class Za {
  client;
  constructor(r, o, a, s) {
    this.client = new ae({ baseUrl: r, timeoutMs: o, retryAttempts: a, getAccessToken: s });
  }
  /**
   * Change the user's password
   *
   * Requires the current password for verification. Also revokes all other sessions
   * and re-encrypts wallet Share A if using password-based wallet protection.
   */
  async changePassword(r) {
    try {
      return await this.client.post("/auth/change-password", r);
    } catch (o) {
      throw W(o, "Failed to change password");
    }
  }
  /**
   * Update user profile (name, picture)
   *
   * NOTE: Requires PATCH /auth/me endpoint on the backend.
   * If not implemented, returns a rejection.
   */
  async updateProfile(r) {
    try {
      return await this.client.patch("/auth/me", r);
    } catch (o) {
      throw W(o, "Failed to update profile");
    }
  }
}
function st() {
  const { config: t, authState: r, _internal: o } = te(), [a, s] = k(!1), [n, l] = k(null), c = q(
    () => new Za(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), d = x(() => {
    l(null);
  }, []), u = x(
    async (f) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      s(!0), l(null);
      try {
        return await c.updateProfile(f);
      } catch (g) {
        const w = g instanceof Error ? g : new Error("Failed to update profile");
        throw l(w), w;
      } finally {
        s(!1);
      }
    },
    [r, c]
  ), m = x(
    async (f) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to change password");
      s(!0), l(null);
      try {
        await c.changePassword(f);
      } catch (g) {
        const w = g instanceof Error ? g : new Error("Failed to change password");
        throw l(w), w;
      } finally {
        s(!1);
      }
    },
    [r, c]
  );
  return {
    isLoading: a,
    error: n,
    updateProfile: u,
    changePassword: m,
    clearError: d
  };
}
function _c({
  onPasswordChange: t,
  onClose: r,
  className: o = ""
}) {
  const { user: a } = et(), { isLoading: s, error: n, changePassword: l, clearError: c } = st(), [d, u] = k("main"), [m, f] = k(""), [g, w] = k(""), [p, h] = k(""), [y, b] = k(null), [v, N] = k(null), E = rt(g), P = g === p, A = m.length > 0 && g.length > 0 && p.length > 0 && E.isValid && P, S = x(async () => {
    if (A) {
      b(null), N(null);
      try {
        await l({
          currentPassword: m,
          newPassword: g
        }), f(""), w(""), h(""), N("Password changed successfully. Other sessions have been logged out."), t?.(), setTimeout(() => {
          u("main"), N(null);
        }, 2e3);
      } catch (B) {
        b(B instanceof Error ? B.message : "Failed to change password");
      }
    }
  }, [A, m, g, l, t]), L = x(() => {
    u("main"), f(""), w(""), h(""), b(null), c();
  }, [c]), C = () => a?.name ? a.name.split(" ").map((B) => B[0]).join("").toUpperCase().slice(0, 2) : a?.email ? a.email[0].toUpperCase() : "?";
  return d === "change-password" ? /* @__PURE__ */ e("div", { className: `cedros-profile-settings ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ e("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (y || n) && /* @__PURE__ */ e("div", { className: "cedros-profile-error", children: /* @__PURE__ */ e(
      X,
      {
        error: { code: "UNKNOWN_ERROR", message: y || n?.message || "" },
        onDismiss: () => {
          b(null), c();
        }
      }
    ) }),
    v && /* @__PURE__ */ i("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ e("span", { className: "cedros-profile-success-icon", children: "✓" }),
      v
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        he,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: m,
          onChange: (B) => f(B.target.value),
          disabled: s,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        he,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: g,
          onChange: (B) => w(B.target.value),
          disabled: s,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        he,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: p,
          onChange: (B) => h(B.target.value),
          disabled: s,
          error: p.length > 0 && !P ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: L,
          disabled: s,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: S,
          disabled: s || !A,
          children: s ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(j, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-profile-settings ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ e("div", { className: "cedros-profile-avatar-container", children: a?.picture ? /* @__PURE__ */ e(
        "img",
        {
          src: a.picture,
          alt: a.name || "Profile",
          className: "cedros-profile-avatar"
        }
      ) : /* @__PURE__ */ e("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: C() }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-info", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-profile-name", children: a?.name || "User" }),
        /* @__PURE__ */ e("p", { className: "cedros-profile-email", children: a?.email })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-row", children: /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ e("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ e("span", { className: "cedros-profile-row-value", children: a?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ e("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ e("span", { className: "cedros-profile-row-value", children: "••••••••" })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u("change-password"),
            children: "Change"
          }
        )
      ] })
    ] }),
    r && /* @__PURE__ */ e("div", { className: "cedros-profile-footer", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md",
        onClick: r,
        children: "Close"
      }
    ) })
  ] }) });
}
class ei {
  client;
  constructor(r, o, a, s) {
    this.client = new ae({ baseUrl: r, timeoutMs: o, retryAttempts: a, getAccessToken: s });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (r) {
      throw W(r, "Failed to list credentials");
    }
  }
  /**
   * Unlink (delete) a credential by ID.
   * The server prevents removing the last primary credential.
   */
  async unlinkCredential(r) {
    try {
      await this.client.delete(`/credentials/${encodeURIComponent(r)}`);
    } catch (o) {
      throw W(o, "Failed to unlink credential");
    }
  }
}
function Cs() {
  const { config: t, authState: r, _internal: o } = te(), [a, s] = k([]), [n, l] = k(!1), [c, d] = k(null), u = q(
    () => new ei(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), m = x(() => {
    d(null);
  }, []), f = x(async () => {
    if (r !== "authenticated") {
      s([]);
      return;
    }
    l(!0), d(null);
    try {
      const w = await u.listCredentials();
      s(w);
    } catch (w) {
      d(w);
    } finally {
      l(!1);
    }
  }, [r, u]);
  _(() => {
    r === "authenticated" ? f() : s([]);
  }, [r, f]);
  const g = x(
    async (w) => {
      l(!0), d(null);
      try {
        await u.unlinkCredential(w), await f();
      } catch (p) {
        throw d(p), p;
      } finally {
        l(!1);
      }
    },
    [u, f]
  );
  return {
    credentials: a,
    isLoading: n,
    error: c,
    fetchCredentials: f,
    unlinkCredential: g,
    clearError: m
  };
}
function ti({
  onPasswordChange: t,
  onCancel: r,
  className: o = ""
}) {
  const { isLoading: a, error: s, changePassword: n, clearError: l } = st(), [c, d] = k(""), [u, m] = k(""), [f, g] = k(""), [w, p] = k(null), [h, y] = k(null), b = rt(u), v = u === f, N = c.length > 0 && u.length > 0 && f.length > 0 && b.isValid && v, E = x(async () => {
    if (N) {
      p(null), y(null);
      try {
        await n({ currentPassword: c, newPassword: u }), d(""), m(""), g(""), y("Password changed successfully. Other sessions have been logged out."), t?.(), setTimeout(() => r(), 2e3);
      } catch (A) {
        p(A instanceof Error ? A.message : "Failed to change password");
      }
    }
  }, [N, c, u, n, t, r]), P = x(() => {
    p(null), l(), r();
  }, [l, r]);
  return /* @__PURE__ */ e("div", { className: `cedros-profile-settings ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ e("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (w || s) && /* @__PURE__ */ e("div", { className: "cedros-profile-error", children: /* @__PURE__ */ e(
      X,
      {
        error: { code: "UNKNOWN_ERROR", message: w || s?.message || "" },
        onDismiss: () => {
          p(null), l();
        }
      }
    ) }),
    h && /* @__PURE__ */ i("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ e("span", { className: "cedros-profile-success-icon", children: "✓" }),
      h
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        he,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: c,
          onChange: (A) => d(A.target.value),
          disabled: a,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        he,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: u,
          onChange: (A) => m(A.target.value),
          disabled: a,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        he,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: f,
          onChange: (A) => g(A.target.value),
          disabled: a,
          error: f.length > 0 && !v ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: P,
          disabled: a,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: E,
          disabled: a || !N,
          children: a ? /* @__PURE__ */ i($, { children: [
            /* @__PURE__ */ e(j, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function ri({ onPasswordChange: t, className: r = "" }) {
  const { user: o, refreshUser: a } = et(), { isLoading: s, error: n, updateProfile: l, clearError: c } = st(), { credentials: d } = Cs(), {
    forgotPassword: u,
    isLoading: m,
    isSuccess: f,
    reset: g
  } = Qt(), w = d.some((C) => C.credentialType === "password"), [p, h] = k("view"), [y, b] = k(""), [v, N] = k(null), E = () => o?.name ? o.name.split(" ").map((C) => C[0]).join("").toUpperCase().slice(0, 2) : o?.email ? o.email[0].toUpperCase() : "?", P = x(() => {
    b(o?.name || ""), h("edit"), N(null);
  }, [o?.name]), A = x(async () => {
    const C = y.trim();
    if (C) {
      N(null);
      try {
        await l({ name: C }), await a(), h("view");
      } catch (B) {
        N(B instanceof Error ? B.message : "Failed to update name");
      }
    }
  }, [y, l, a]), S = x(() => {
    h("view"), b(""), N(null), c();
  }, [c]), L = x(async () => {
    if (o?.email) {
      N(null);
      try {
        await u(o.email);
      } catch (C) {
        N(C instanceof Error ? C.message : "Failed to send password setup email");
      }
    }
  }, [o?.email, u]);
  return p === "change-password" ? /* @__PURE__ */ e(
    ti,
    {
      onPasswordChange: t,
      onCancel: () => h("view"),
      className: r
    }
  ) : /* @__PURE__ */ e("div", { className: `cedros-profile-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ e("div", { className: "cedros-profile-avatar-container", children: o?.picture ? /* @__PURE__ */ e(
        "img",
        {
          src: o.picture,
          alt: o.name || "Profile",
          className: "cedros-profile-avatar"
        }
      ) : /* @__PURE__ */ e("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: E() }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-info", children: [
        p === "edit" ? /* @__PURE__ */ i("div", { className: "cedros-profile-name-edit", children: [
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              className: "cedros-input",
              value: y,
              onChange: (C) => b(C.target.value),
              disabled: s,
              autoFocus: !0,
              onKeyDown: (C) => {
                C.key === "Enter" && A(), C.key === "Escape" && S();
              }
            }
          ),
          /* @__PURE__ */ i("div", { className: "cedros-profile-name-edit-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary cedros-button-sm",
                onClick: A,
                disabled: s || !y.trim(),
                children: s ? /* @__PURE__ */ e(j, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: S,
                disabled: s,
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ i("div", { className: "cedros-profile-name-row", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-profile-name", children: o?.name || "User" }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-profile-edit-btn",
              onClick: P,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ e(si, {})
            }
          )
        ] }),
        /* @__PURE__ */ e("p", { className: "cedros-profile-email", children: o?.email })
      ] })
    ] }),
    (v || n) && /* @__PURE__ */ e("div", { className: "cedros-profile-error", children: /* @__PURE__ */ e(
      X,
      {
        error: { code: "UNKNOWN_ERROR", message: v || n?.message || "" },
        onDismiss: () => {
          N(null), c();
        }
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-row", children: /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ e("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ e("span", { className: "cedros-profile-row-value", children: o?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ e("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ e("span", { className: "cedros-profile-row-value", children: w ? "••••••••" : "Not set" })
        ] }),
        w ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              h("change-password"), N(null);
            },
            children: "Change"
          }
        ) : f ? /* @__PURE__ */ i("span", { className: "cedros-profile-row-sent", children: [
          "Check your email",
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-profile-row-sent-dismiss",
              onClick: g,
              "aria-label": "Dismiss",
              children: "×"
            }
          )
        ] }) : /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: L,
            disabled: m,
            children: m ? /* @__PURE__ */ e(j, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function si() {
  return /* @__PURE__ */ i("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e(
      "path",
      {
        d: "M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 10-2.621-2.621z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ e(
      "path",
      {
        d: "M19 15v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h3",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
const Es = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function oi({
  onLinkGoogle: t,
  onLinkApple: r,
  onAddPasskey: o,
  onLinkSolana: a,
  className: s = ""
}) {
  const { credentials: n, isLoading: l, error: c, unlinkCredential: d, clearError: u, fetchCredentials: m } = Cs(), { registerPasskey: f, isSupported: g } = fs(), [w, p] = k(null), [h, y] = k(!1), b = x(async () => {
    if (o) {
      o();
      return;
    }
    y(!0);
    try {
      await f(), await m();
    } catch {
    } finally {
      y(!1);
    }
  }, [o, f, m]), v = x(
    async (C) => {
      const B = C.label || Es[C.credentialType];
      if (window.confirm(
        `Remove "${B}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        p(C.id);
        try {
          await d(C.id);
        } catch {
        } finally {
          p(null);
        }
      }
    },
    [d]
  ), N = new Set(n.map((C) => C.credentialType)), E = t && !N.has("oauth_google"), P = r && !N.has("oauth_apple"), A = (o || g) && !N.has("webauthn_passkey"), S = a && !N.has("solana"), L = E || P || A || S;
  return l && n.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-linked-accounts ${s}`, children: [
    /* @__PURE__ */ e(j, {}),
    /* @__PURE__ */ e("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-linked-accounts ${s}`, children: [
    c && /* @__PURE__ */ e(
      X,
      {
        error: { code: "UNKNOWN_ERROR", message: c.message },
        onDismiss: u
      }
    ),
    n.length === 0 && !l && /* @__PURE__ */ e("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    n.length > 0 && /* @__PURE__ */ e("ul", { className: "cedros-linked-credential-list", children: n.map((C) => /* @__PURE__ */ e(
      ni,
      {
        credential: C,
        isUnlinking: w === C.id,
        onUnlink: v
      },
      C.id
    )) }),
    L && /* @__PURE__ */ i("div", { className: "cedros-linked-add", children: [
      /* @__PURE__ */ e("p", { className: "cedros-linked-add-label", children: "Link a new sign-in method" }),
      /* @__PURE__ */ i("div", { className: "cedros-linked-add-buttons", children: [
        E && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: t,
            children: [
              /* @__PURE__ */ e(Ss, {}),
              " Google"
            ]
          }
        ),
        P && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: r,
            children: [
              /* @__PURE__ */ e(xs, {}),
              " Apple"
            ]
          }
        ),
        A && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: b,
            disabled: h,
            children: h ? /* @__PURE__ */ e(j, { size: "sm" }) : /* @__PURE__ */ i($, { children: [
              /* @__PURE__ */ e(qt, {}),
              " Passkey"
            ] })
          }
        ),
        S && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: a,
            children: [
              /* @__PURE__ */ e(Ps, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function ni({
  credential: t,
  isUnlinking: r,
  onUnlink: o
}) {
  const a = t.label || Es[t.credentialType], s = ai[t.credentialType] || ii;
  return /* @__PURE__ */ i("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ e("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ e(s, {}) }),
    /* @__PURE__ */ i("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ e("span", { className: "cedros-linked-credential__name", children: a }),
      /* @__PURE__ */ i("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        _r(t.createdAt),
        t.lastUsedAt && /* @__PURE__ */ i($, { children: [
          " · Last used ",
          _r(t.lastUsedAt)
        ] }),
        t.isPrimary && /* @__PURE__ */ e($, { children: " · Primary" })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-linked-credential__action", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm cedros-button-danger-outline",
        onClick: () => o(t),
        disabled: r,
        title: t.isPrimary ? "Cannot remove primary sign-in method" : "Remove",
        children: r ? /* @__PURE__ */ e(j, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function _r(t) {
  const r = new Date(t), a = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60)), n = Math.floor(a / (1e3 * 60 * 60)), l = Math.floor(a / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s}m ago` : n < 24 ? `${n}h ago` : l < 30 ? `${l}d ago` : r.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const ai = {
  password: ci,
  oauth_google: Ss,
  oauth_apple: xs,
  solana: Ps,
  webauthn_passkey: qt,
  webauthn_security_key: qt,
  totp: li,
  sso_oidc: di
};
function ii() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function ci() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ e("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function Ss() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ e("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ e("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ e("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function xs() {
  return /* @__PURE__ */ e("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ e(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function Ps() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function qt() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ e("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function li() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function di() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ e("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
class ui {
  client;
  constructor(r, o, a, s) {
    this.client = new ae({ baseUrl: r, timeoutMs: o, retryAttempts: a, getAccessToken: s });
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
function hi() {
  const { config: t, authState: r, _internal: o } = te(), [a, s] = k([]), [n, l] = k(!1), [c, d] = k(null), u = q(
    () => new ui(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), m = x(async () => {
    if (r !== "authenticated") {
      s([]);
      return;
    }
    l(!0), d(null);
    try {
      const w = await u.listSessions();
      s(w);
    } catch (w) {
      d(w);
    } finally {
      l(!1);
    }
  }, [r, u]);
  _(() => {
    r === "authenticated" ? m() : s([]);
  }, [r, m]);
  const f = x(async () => {
    l(!0), d(null);
    try {
      const w = await u.revokeAllSessions();
      return await m(), w;
    } catch (w) {
      throw d(w), w;
    } finally {
      l(!1);
    }
  }, [u, m]), g = q(() => a.filter((w) => !w.isCurrent).length, [a]);
  return {
    sessions: a,
    isLoading: n,
    error: c,
    fetchSessions: m,
    revokeAllSessions: f,
    otherSessionCount: g
  };
}
const pi = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, mi = ["profile", "security", "linked"];
function Wc({
  defaultTab: t = "profile",
  onClose: r,
  onPasswordChange: o,
  onTotpChange: a,
  onLinkGoogle: s,
  onLinkApple: n,
  onAddPasskey: l,
  onLinkSolana: c,
  className: d = ""
}) {
  const [u, m] = k(t), { sessions: f, isLoading: g, error: w, revokeAllSessions: p } = hi();
  return /* @__PURE__ */ i("div", { className: `cedros-account-settings ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-account-tabs--line", role: "tablist", children: mi.map((h) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": u === h,
        className: `cedros-account-tab ${u === h ? "cedros-account-tab-active" : ""}`,
        onClick: () => m(h),
        children: pi[h]
      },
      h
    )) }),
    /* @__PURE__ */ i("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      u === "profile" && /* @__PURE__ */ e(ri, { onPasswordChange: o }),
      u === "security" && /* @__PURE__ */ i("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ e(Xa, { onStatusChange: a }),
        /* @__PURE__ */ e(
          Dn,
          {
            sessions: f,
            isLoading: g,
            error: w ?? void 0,
            onRevokeAll: async () => {
              await p();
            }
          }
        )
      ] }),
      u === "linked" && /* @__PURE__ */ e(
        oi,
        {
          onLinkGoogle: s,
          onLinkApple: n,
          onAddPasskey: l,
          onLinkSolana: c
        }
      )
    ] }),
    r && /* @__PURE__ */ e("div", { className: "cedros-account-footer", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md",
        onClick: r,
        children: "Close"
      }
    ) })
  ] });
}
function Oc({ onComplete: t, className: r }) {
  return /* @__PURE__ */ i("div", { className: `cedros-mfa-setup-prompt ${r ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ e("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ e(Ns, { onSuccess: t }) })
  ] });
}
function qc({
  onComplete: t,
  onSkip: r,
  className: o
}) {
  const { user: a } = et(), { isLoading: s, error: n, updateProfile: l, clearError: c } = st(), [d, u] = k(a?.name ?? ""), m = x(
    async (g) => {
      g.preventDefault(), c();
      const w = d.trim();
      if (!w) {
        t?.();
        return;
      }
      try {
        await l({ name: w }), t?.();
      } catch {
      }
    },
    [d, l, c, t]
  ), f = d.trim().length > 0;
  return /* @__PURE__ */ i("div", { className: `cedros-complete-account ${o ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-complete-account__header", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-complete-account__title", children: "Complete Your Profile" }),
      /* @__PURE__ */ e("p", { className: "cedros-complete-account__description", children: "Please fill in your name to get started." })
    ] }),
    /* @__PURE__ */ i("form", { onSubmit: m, className: "cedros-complete-account__form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-complete-account__field", children: [
        /* @__PURE__ */ e(
          "label",
          {
            htmlFor: "cedros-complete-name",
            className: "cedros-complete-account__label",
            children: "Name"
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            id: "cedros-complete-name",
            type: "text",
            value: d,
            onChange: (g) => u(g.target.value),
            placeholder: "Enter your name",
            className: "cedros-complete-account__input",
            maxLength: 100,
            autoFocus: !0
          }
        )
      ] }),
      n && /* @__PURE__ */ e("div", { className: "cedros-complete-account__error", role: "alert", children: n.message }),
      /* @__PURE__ */ i("div", { className: "cedros-complete-account__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-complete-account__button cedros-complete-account__button--primary",
            disabled: s || !f,
            children: s ? "Saving..." : "Save"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-complete-account__button cedros-complete-account__button--secondary",
            onClick: r,
            disabled: s,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function fi() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), n = q(() => t ? new ae({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = x(() => {
    s(null);
  }, []), c = x(
    async (p) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(p) || p <= 0) {
        const h = new Error(
          `Invalid deposit amount: ${p}. Must be a positive integer (lamports).`
        );
        throw s(h.message), h;
      }
      o(!0), s(null);
      try {
        return await n.post("/deposit", {
          amount_lamports: p
        });
      } catch (h) {
        const y = W(h, "Failed to execute deposit");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), d = x(
    async (p) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.get(`/deposit/status/${encodeURIComponent(p)}`);
      } catch (h) {
        const y = W(h, "Failed to get deposit status");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), u = x(async () => {
    if (!n)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return await n.get("/deposit/config");
    } catch (p) {
      const h = W(p, "Failed to get deposit config");
      throw s(h.message), h;
    } finally {
      o(!1);
    }
  }, [n]), m = x(
    async (p) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const h = new URLSearchParams();
        p?.limit !== void 0 && h.set("limit", String(p.limit)), p?.offset !== void 0 && h.set("offset", String(p.offset));
        const y = h.toString(), b = y ? `/deposits?${y}` : "/deposits";
        return await n.get(b);
      } catch (h) {
        const y = W(h, "Failed to list deposits");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), f = x(
    async (p) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const h = new URLSearchParams({
          input_mint: p.inputMint,
          amount: String(p.amount),
          taker: p.taker
        });
        return await n.get(`/deposit/quote?${h}`);
      } catch (h) {
        const y = W(h, "Failed to get deposit quote");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), g = x(
    async (p) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.post("/deposit/public", p);
      } catch (h) {
        const y = W(h, "Failed to execute public deposit");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), w = x(
    async (p) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.post("/deposit/micro", p);
      } catch (h) {
        const y = W(h, "Failed to execute micro deposit");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  );
  return {
    deposit: c,
    getQuote: f,
    publicDeposit: g,
    microDeposit: w,
    getStatus: d,
    getConfig: u,
    listDeposits: m,
    isLoading: r,
    error: a,
    clearError: l
  };
}
function Ls({
  tokens: t,
  selectedToken: r,
  onSelect: o,
  openSignal: a,
  placeholder: s = "Select token",
  disabled: n = !1,
  className: l = "",
  searchable: c = !0
}) {
  const [d, u] = k(!1), [m, f] = k(""), g = J(null), w = J(null), p = q(() => {
    if (!m.trim()) return t;
    const v = m.toLowerCase();
    return t.filter(
      (N) => N.symbol.toLowerCase().includes(v) || N.name.toLowerCase().includes(v) || N.mint.toLowerCase().includes(v)
    );
  }, [t, m]);
  _(() => {
    const v = (N) => {
      g.current && !g.current.contains(N.target) && (u(!1), f(""));
    };
    if (d)
      return document.addEventListener("mousedown", v), () => document.removeEventListener("mousedown", v);
  }, [d]), _(() => {
    d && c && w.current && w.current.focus();
  }, [d, c]), _(() => {
    a === void 0 || n || (u(!0), f(""));
  }, [a, n]);
  const h = x(() => {
    n || (u((v) => !v), d && f(""));
  }, [n, d]), y = x(
    (v) => {
      o(v), u(!1), f("");
    },
    [o]
  ), b = x(
    (v) => {
      v.key === "Escape" ? (u(!1), f("")) : v.key === "Enter" && p.length === 1 && y(p[0]);
    },
    [p, y]
  );
  return /* @__PURE__ */ i(
    "div",
    {
      ref: g,
      className: `cedros-token-selector ${d ? "cedros-token-selector-open" : ""} ${n ? "cedros-token-selector-disabled" : ""} ${l}`,
      onKeyDown: b,
      children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: h,
            disabled: n,
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
              ] }) : /* @__PURE__ */ e("span", { className: "cedros-token-selector-placeholder", children: s }),
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
              value: m,
              onChange: (v) => f(v.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-token-list", children: p.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ e($, { children: p.map((v) => /* @__PURE__ */ i(
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
                    onError: (N) => {
                      N.target.style.display = "none";
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
function $t(t, r) {
  return r.privateDepositsEnabled && t >= r.privateMinUsd ? "private" : t >= r.publicMinUsd ? "public" : "sol_micro";
}
const Gt = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", gi = 1e4, Ze = 1e3, Ms = 3;
function wi(t) {
  return Number.isFinite(t) ? `$${Math.round(t)}` : "$0";
}
function yi(t, r) {
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
        detail: `SOL only under ${wi(r.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function Jt(t, r, o) {
  return Math.min(Math.max(t, r), o);
}
function bi(t, r) {
  if (r <= 0) return 0;
  const o = Jt(t / r, 0, 1);
  return Math.round(Math.pow(o, 1 / Ms) * Ze);
}
function Ai(t, r) {
  const o = Jt(t / Ze, 0, 1);
  return r * Math.pow(o, Ms);
}
function Ts(t) {
  return t < 10 ? 0.01 : t < 100 ? 1 : t < 500 ? 5 : t < 1e3 ? 10 : t < 5e3 ? 25 : 50;
}
function vi(t) {
  return t < 1 ? 2 : 0;
}
function Wr(t) {
  const r = Ts(t), o = Math.round(t / r) * r, a = vi(r);
  return Number(o.toFixed(a));
}
function Bs({
  config: t,
  valueUsd: r,
  onChange: o,
  maxUsd: a = gi,
  disabled: s = !1,
  className: n = ""
}) {
  const l = Jt(Number.isFinite(r) ? r : 0, 0, a), c = q(() => $t(l, t), [l, t]), d = yi(c, t), u = bi(l, a), m = u / Ze * 100;
  return /* @__PURE__ */ i("div", { className: `cedros-tiered-slider ${n}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ e("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            value: l || "",
            onChange: (f) => o(Wr(parseFloat(f.target.value) || 0)),
            placeholder: "Enter amount",
            disabled: s,
            min: 0,
            step: Ts(l),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ i("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${c}`, children: [
          c === "sol_micro" && /* @__PURE__ */ e("img", { src: Gt, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        max: Ze,
        step: 1,
        value: u,
        onChange: (f) => o(Wr(Ai(parseFloat(f.target.value), a))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${m}%, var(--cedros-border) ${m}%, var(--cedros-border) 100%)`
        },
        disabled: s,
        "aria-label": "Deposit amount slider"
      }
    ),
    d.note && /* @__PURE__ */ e("div", { className: "cedros-tiered-slider-note", children: d.note })
  ] });
}
function ki(t) {
  return t.companyFeePercent > 0 || t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap" || t.feePolicy === "user_pays_privacy";
}
function Ni(t, r, o) {
  const { feePolicy: a, privacyFeePercent: s, swapFeePercent: n, companyFeePercent: l } = t;
  let c = l;
  return o || (a === "user_pays_all" ? (c += n, r && (c += s)) : a === "user_pays_privacy" && r ? c += s : a === "user_pays_swap" && (c += n)), c;
}
const Ve = 1e9, Se = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Gt
}, xe = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, Rs = 1e4;
function Ci(t, r) {
  const o = r < t.publicMinUsd, a = r >= t.privateMinUsd, s = [], n = !o && a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0), l = !o && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0), c = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  if (n) {
    const d = t.privacyFeeFixedLamports / Ve, u = t.privacyFeePercent, m = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Privacy", solAmount: d, percent: u, usdAmount: m + f });
  }
  if (l) {
    const d = t.swapFeeFixedLamports / Ve, u = t.swapFeePercent, m = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Swap", solAmount: d, percent: u, usdAmount: m + f });
  }
  if (c) {
    const d = t.companyFeeFixedLamports / Ve, u = t.companyFeePercent, m = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Service", solAmount: d, percent: u, usdAmount: m + f });
  }
  return s;
}
function Is(t, r, o) {
  const a = Ci(t, r), s = o < 0.01 ? 0.01 : o;
  if (a.length === 0)
    return `Total: $${s.toFixed(2)}`;
  const n = a.reduce((p, h) => p + h.solAmount, 0), l = a.reduce((p, h) => p + h.percent, 0), c = { fee: 7, sol: 8, rate: 7, usd: 8 }, d = (p) => {
    const h = p.label.padEnd(c.fee), y = p.solAmount.toFixed(4).padStart(6).padEnd(c.sol), b = (p.percent.toFixed(2) + "%").padStart(5).padEnd(c.rate), v = ("$" + Math.max(p.usdAmount, 0.01).toFixed(2)).padEnd(c.usd);
    return `${h} │ ${y} │ ${b} │ ${v}`;
  }, u = `${"Fee".padEnd(c.fee)} │ ${"SOL".padEnd(c.sol)} │ ${"+ Rate".padEnd(c.rate)} │ ${"= Total".padEnd(c.usd)}`, m = `${"─".repeat(c.fee)}─┼─${"─".repeat(c.sol)}─┼─${"─".repeat(c.rate)}─┼─${"─".repeat(c.usd)}`, f = ("$" + s.toFixed(2)).padEnd(c.usd), g = `${"TOTAL".padEnd(c.fee)} │ ${n.toFixed(4).padStart(6).padEnd(c.sol)} │ ${(l.toFixed(2) + "%").padStart(5).padEnd(c.rate)} │ ${f}`;
  return [u, m, ...a.map(d), m, g].join(`
`);
}
function Ei(t) {
  const r = [], o = t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0, a = t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0, s = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  return o && r.push("Privacy Cash fee"), a && r.push("swap fee"), s && r.push("company service fee"), r.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function ot(t, r) {
  if (r <= 0) return 0;
  const o = r < t.publicMinUsd, a = r >= t.privateMinUsd, s = Ni(t, a, o);
  let n = t.companyFeeFixedLamports;
  o || (a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (n += t.privacyFeeFixedLamports), (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (n += t.swapFeeFixedLamports));
  const l = n / Ve * t.solPriceUsd, c = r * (s / 100);
  return l + c;
}
function Ds(t, r, o) {
  return t === "sol" ? "SOL" : t === "single-token" ? r.symbol : o.some((s) => s.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function Or(t) {
  return t.map((r) => r.trim()).filter(Boolean);
}
const Us = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function Fs(t, r, o) {
  if (Us.has(t.symbol)) return 1;
  const a = r.tokenPrices?.[t.symbol];
  if (a && a > 0) return a;
  if (t.symbol === "SOL") return r.solPriceUsd || null;
  const s = o?.[t.symbol];
  return s && s > 0 ? s : null;
}
function _s(t, r) {
  const o = Us.has(r) ? 2 : 4;
  return t.toFixed(o);
}
function jc({
  config: t,
  currencyMode: r,
  depositMethod: o,
  tokens: a = [],
  defaultToken: s,
  minAmount: n,
  maxAmount: l = 1e4,
  onSuccess: c,
  onError: d,
  onCancel: u,
  onUnlockRequired: m,
  onAuthorize: f,
  className: g = "",
  showStepIndicator: w = !0,
  pollInterval: p = 5e3,
  demoMode: h = !1,
  demoAutoConfirmMs: y,
  tokenPriceUsd: b,
  showExplainer: v = !1,
  siteName: N,
  explainerConfig: E
}) {
  const { deposit: P, getStatus: A, error: S, clearError: L } = fi(), C = tt(), B = Or(t.quickActionTokens), T = Or(t.customTokenSymbols), M = q(() => {
    const O = t.customTokens ?? [];
    if (O.length === 0) return a;
    const H = new Set(a.map((Z) => Z.symbol)), Y = [...a];
    for (const Z of O)
      H.has(Z.symbol) || (Y.push({
        mint: Z.mint,
        symbol: Z.symbol,
        name: Z.symbol,
        // Use symbol as name for custom tokens
        decimals: Z.decimals,
        logoUrl: Z.logoUrl
      }), H.add(Z.symbol));
    return Y;
  }, [a, t.customTokens]), R = q(() => {
    if (T.length === 0) return M;
    const O = M.filter((H) => T.includes(H.symbol));
    return O.length > 0 ? O : M;
  }, [M, T]), I = t.privateDepositsEnabled, U = o ? o === "sign" && !I ? "receive" : o : I && C.hasExternalWallet ? "sign" : "receive", ee = B[0] ? M.find((O) => O.symbol === B[0]) : void 0, pe = r === "sol" ? Se : r === "single-token" ? ee ?? M.find((O) => O.symbol === "USDC") ?? M[0] ?? Se : s ?? ee ?? M.find((O) => O.symbol === "USDC") ?? M.find((O) => O.symbol !== "SOL") ?? M[0] ?? Se, re = x(() => v ? "explainer" : "unlock", [v]), [Q, D] = k(re), [F, K] = k(pe), [se, ne] = k(""), [ge, me] = k(null), [V, z] = k(null), [G, de] = k(null), [be, Zt] = k(null), [nt, Me] = k(!1), [js, at] = k(!1), [De, er] = k(null);
  _(() => {
    D(re()), K(pe), ne(""), me(null), z(null), de(null), Zt(null), Me(!1), at(!1), er(null), L();
  }, [r, U, pe, L, re]);
  const zs = n ?? t.privateMinSol, Vs = l, Ue = parseFloat(se), tr = C.status === "enrolled_locked" || C.status === "enrolled_unlocked" || C.status === "unlocked", it = tr && C.isUnlocked, ct = tr && !C.isUnlocked, rr = x(() => {
    let Y = U === "sign" ? [
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
    return v && (Y = [{ key: "explainer", label: "Info" }, ...Y]), Y;
  }, [U, v])(), Hs = rr.findIndex((O) => O.key === Q), sr = x((O) => {
    K(O);
  }, []), Qs = x(
    async (O) => {
      if (!f) {
        D(U === "sign" ? "confirm" : "show-address");
        return;
      }
      at(!0), z(null);
      try {
        const Y = await f(O, U === "sign" ? Ue : null, F);
        de(Y.sessionId), Zt(Y.depositAddress), D(U === "sign" ? "confirm" : "show-address");
      } catch (H) {
        const Y = H instanceof Error ? H : new Error("Authorization failed");
        z(Y.message);
      } finally {
        at(!1);
      }
    },
    [f, U, Ue, F]
  ), Ks = x(
    async (O, H) => {
      L(), z(null), D("signing");
      const Y = O ?? Ue, Z = H ?? F;
      if (!h) {
        if (ct && m) {
          m(), D("confirm");
          return;
        }
        if (!it) {
          z("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const ce = Math.floor(Y * Math.pow(10, Z.decimals));
        if (h) {
          await new Promise((We) => setTimeout(We, 1500));
          const _e = {
            token: r === "sol" ? null : Z,
            amount: Y,
            amountSmallestUnit: ce,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: G || `demo-session-${Date.now()}`,
            response: {
              sessionId: G || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: ce,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          me(_e), D("success"), c?.(_e);
          return;
        }
        const ie = await P(ce), Fe = {
          token: r === "sol" ? null : Z,
          amount: Y,
          amountSmallestUnit: ce,
          txSignature: ie.txSignature,
          sessionId: ie.sessionId,
          response: ie,
          method: "sign"
        };
        me(Fe), D("success"), c?.(Fe);
      } catch (ce) {
        const ie = ce instanceof Error ? ce : new Error("Deposit failed");
        z(ie.message), D("error"), d?.(ie);
      }
    },
    [
      P,
      Ue,
      F,
      r,
      h,
      G,
      it,
      ct,
      m,
      c,
      d,
      L
    ]
  ), Ys = x(() => {
    D("waiting");
  }, []), lt = x(async () => {
    const O = be || C.solanaPubkey;
    if (O)
      try {
        await navigator.clipboard.writeText(O), Me(!0), setTimeout(() => Me(!1), 2e3);
      } catch {
        const H = document.createElement("textarea");
        H.value = O, document.body.appendChild(H), H.select(), document.execCommand("copy"), document.body.removeChild(H), Me(!0), setTimeout(() => Me(!1), 2e3);
      }
  }, [be, C.solanaPubkey]);
  _(() => {
    if (!(Q === "confirm" || Q === "show-address" || Q === "waiting") || !G || h) return;
    let H = !1, Y = 0;
    const Z = 360, ce = async () => {
      if (!(H || Y >= Z)) {
        Y++;
        try {
          const ie = await A(G);
          if (ie.status === "completed" || ie.status === "detected") {
            const Fe = ie.amountLamports ? ie.amountLamports / Math.pow(10, F.decimals) : 0, _e = ie.amountLamports || 0, We = {
              token: r === "sol" ? null : F,
              amount: Fe,
              amountSmallestUnit: _e,
              txSignature: ie.txSignature || "",
              sessionId: G,
              response: ie,
              method: "receive",
              depositAddress: C.solanaPubkey ?? void 0
            };
            me(We), D("success"), c?.(We);
            return;
          }
        } catch {
        }
        H || setTimeout(ce, p);
      }
    };
    return ce(), () => {
      H = !0;
    };
  }, [
    Q,
    G,
    h,
    A,
    F,
    r,
    C.solanaPubkey,
    c,
    p
  ]), _(() => {
    if (!h || !y || Q !== "waiting" || U !== "receive" || !be) return;
    const O = window.setTimeout(() => {
      const H = De ?? t.privateMinUsd, Y = F.symbol === "SOL" && t.solPriceUsd > 0 ? H / t.solPriceUsd : H, Z = Math.floor(Y * Math.pow(10, F.decimals)), ce = {
        token: r === "sol" ? null : F,
        amount: Y,
        amountSmallestUnit: Z,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: G || `demo-session-${Date.now()}`,
        response: {
          sessionId: G || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: Z,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: be ?? void 0
      };
      me(ce), D("success"), c?.(ce);
    }, y);
    return () => window.clearTimeout(O);
  }, [
    h,
    y,
    Q,
    U,
    be,
    De,
    t,
    F,
    r,
    G,
    c
  ]);
  const $s = x(() => {
    D(re()), ne(""), me(null), z(null), L();
  }, [re, L]);
  return t.enabled ? /* @__PURE__ */ i("div", { className: `cedros-deposit-flow ${g}`, children: [
    w && Q !== "error" && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-steps", children: rr.map((O, H) => {
      const Y = Hs >= H, Z = O.key === Q;
      return /* @__PURE__ */ i(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${Y ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${Y ? "active" : ""} ${Z ? "current" : ""}`,
                children: H + 1
              }
            ),
            /* @__PURE__ */ e("span", { className: `cedros-deposit-flow-step-label ${Y ? "active" : ""}`, children: O.label })
          ]
        },
        O.key
      );
    }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-content", children: [
      Q === "explainer" && /* @__PURE__ */ e(
        Si,
        {
          siteName: N,
          config: E,
          depositConfig: t,
          currencyMode: r,
          token: F,
          tokens: R,
          onContinue: () => D("unlock"),
          onCancel: u
        }
      ),
      Q === "unlock" && /* @__PURE__ */ e(
        xi,
        {
          token: F,
          tokens: R,
          currencyMode: r,
          depositMethod: U,
          isAuthorizing: js,
          error: V,
          onAuthorize: Qs,
          onBack: v ? () => D("explainer") : void 0,
          onCancel: u
        }
      ),
      Q === "confirm" && U === "sign" && /* @__PURE__ */ e(
        Pi,
        {
          token: F,
          tokens: M,
          quickActionSymbols: B,
          customTokenSymbols: T,
          currencyMode: r,
          minAmount: zs,
          maxAmount: Vs,
          depositAddress: be || C.solanaPubkey,
          walletReady: it || h,
          needsUnlock: ct && !h,
          copied: nt,
          isListening: !!G && !h,
          config: t,
          onCopy: lt,
          onTokenSelect: sr,
          onUnlockRequired: m,
          onConfirm: (O, H) => Ks(O, H),
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      Q === "signing" && /* @__PURE__ */ e(Li, { depositAddress: C.solanaPubkey }),
      Q === "show-address" && /* @__PURE__ */ e(
        Mi,
        {
          token: F,
          tokens: M,
          quickActionSymbols: B,
          customTokenSymbols: T,
          tokenPriceUsd: b,
          currencyMode: r,
          depositAddress: be || C.solanaPubkey,
          copied: nt,
          isListening: !!G && !h,
          config: t,
          onCopy: lt,
          onTokenSelect: sr,
          onAmountChange: er,
          onSent: Ys,
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      Q === "waiting" && /* @__PURE__ */ e(
        Ti,
        {
          token: F,
          depositAddress: be || C.solanaPubkey,
          copied: nt,
          feeLine: De ? `Fees: $${Math.max(ot(t, De), 0.01).toFixed(2)} total` : "Fees: calculated after deposit",
          onCopy: lt
        }
      ),
      Q === "success" && ge && /* @__PURE__ */ e(Bi, { result: ge, config: t, onNewDeposit: $s }),
      Q === "error" && /* @__PURE__ */ e(
        Ri,
        {
          error: V || S || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ e("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${g}`, children: /* @__PURE__ */ e("p", { children: "Deposits are not currently available." }) });
}
function Si({
  siteName: t,
  config: r,
  depositConfig: o,
  currencyMode: a,
  token: s,
  tokens: n,
  onContinue: l,
  onCancel: c
}) {
  const d = r?.title ?? "How Deposits Work", u = r?.exchangeName ?? "Coinbase", m = no(r?.exchangeUrl) ?? "https://www.coinbase.com", f = r?.showExchangeSuggestion !== !1, g = Ds(a, s, n), w = t ? `${t} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", p = r?.body ?? w, h = ki(o), y = Ei(o);
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: d }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: p }),
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
          /* @__PURE__ */ e("strong", { children: h ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ e("p", { children: y })
        ] })
      ] })
    ] }),
    f && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ e("strong", { children: "New to Solana?" }),
      " You can purchase ",
      g,
      " using your credit card at",
      " ",
      /* @__PURE__ */ e("a", { href: m, target: "_blank", rel: "noopener noreferrer", children: u }),
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
function xi({
  token: t,
  tokens: r,
  currencyMode: o,
  depositMethod: a,
  isAuthorizing: s,
  error: n,
  onAuthorize: l,
  onBack: c
}) {
  const [d, u] = k(""), m = Ds(o, t, r), f = (g) => {
    g.preventDefault(), d.trim() && l(d);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: a === "sign" ? o === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${m} deposit. This allows us to process your withdrawal when the privacy period ends.` : o === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${m} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ i("form", { onSubmit: f, children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: d,
            onChange: (g) => u(g.target.value),
            className: "cedros-deposit-flow-input",
            placeholder: "Enter your password",
            disabled: s,
            autoComplete: "current-password"
          }
        )
      ] }),
      n && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-error", children: n }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
            onClick: c,
            disabled: s,
            children: "Back"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
            disabled: !d.trim() || s,
            children: s ? "Authorizing..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function Pi({
  token: t,
  tokens: r,
  quickActionSymbols: o,
  customTokenSymbols: a,
  currencyMode: s,
  minAmount: n,
  maxAmount: l,
  depositAddress: c,
  walletReady: d,
  needsUnlock: u,
  copied: m,
  isListening: f,
  config: g,
  onCopy: w,
  onTokenSelect: p,
  onUnlockRequired: h,
  onConfirm: y,
  onBack: b
}) {
  const [v, N] = k(g.privateMinUsd), [E, P] = k(!1), [A, S] = k(!1), [L, C] = k(0), [B, T] = k(null), R = $t(v, g) === "sol_micro", I = t.symbol === xe.symbol, U = q(() => {
    const V = a.length === 0 ? r : r.filter((de) => a.includes(de.symbol)), z = V.length > 0 ? V : r;
    return z.some((de) => de.symbol === xe.symbol) ? z : [...z, xe];
  }, [r, a]), ee = ot(g, v), pe = ee < 0.01 ? 0.01 : ee, re = I ? "Fees: calculated after deposit" : `Fees: $${pe.toFixed(2)} total`, Q = I ? "" : Is(g, v, ee), D = Fs(R ? Se : t, g), F = D ? v / D : t.symbol === "SOL" && g.solPriceUsd > 0 ? v / g.solPriceUsd : v, K = F ? _s(F, R ? "SOL" : t.symbol) : null, ne = v - ee <= 0 && v > 0, ge = !I && v > 0 && !ne && F >= n && F <= l;
  _(() => {
    if (s === "multi-token")
      if (R && t.symbol !== "SOL") {
        T(t);
        const V = r.find((z) => z.symbol === "SOL");
        V && p(V);
      } else !R && B && t.symbol === "SOL" && (p(B), T(null));
  }, [R, t.symbol, s, r, p, B, t]);
  const me = () => {
    ge && y(F, t);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    s === "multi-token" && !R && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        o.map((V) => {
          const z = r.find((de) => de.symbol === V), G = t.symbol === V;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${G ? "is-active" : ""}`,
              onClick: () => {
                z && (P(!1), p(z));
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
            className: `cedros-deposit-flow-token-quick-btn ${E ? "is-active" : ""}`,
            onClick: () => {
              P(!0), C((V) => V + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      E && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        Ls,
        {
          tokens: U,
          selectedToken: t,
          onSelect: p,
          openSignal: L
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ e(
      Bs,
      {
        config: g,
        valueUsd: v,
        onChange: N,
        maxUsd: Rs
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: I ? "Sign to send tokens to this address" : `Sign to send ${K ?? "--"} ${R ? "SOL" : t.symbol} to this address` }),
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
              children: m ? "✓" : "⧉"
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
      m && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    ne && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ e("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ e("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ i("span", { children: [
          re,
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${A ? "is-open" : ""}`,
              "data-tooltip": Q,
              "aria-label": `Fee breakdown: ${Q.replaceAll(`
`, ", ")}`,
              "aria-expanded": A,
              onClick: (V) => {
                V.stopPropagation(), S((z) => !z);
              },
              onBlur: () => S(!1),
              onKeyDown: (V) => {
                V.key === "Escape" && S(!1);
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
      h && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: h,
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
          onClick: b,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: me,
          disabled: !ge || !d || !c,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function Li({ depositAddress: t }) {
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
function Mi({
  token: t,
  tokens: r,
  quickActionSymbols: o,
  customTokenSymbols: a,
  tokenPriceUsd: s,
  currencyMode: n,
  depositAddress: l,
  copied: c,
  isListening: d,
  config: u,
  onCopy: m,
  onTokenSelect: f,
  onAmountChange: g,
  onSent: w,
  onBack: p
}) {
  const [h, y] = k(u.privateMinUsd), [b, v] = k(!1), [N, E] = k(!1), [P, A] = k(0), [S, L] = k(null), B = $t(h, u) === "sol_micro", T = t.symbol === xe.symbol, M = q(() => {
    const F = a.length === 0 ? r : r.filter((ne) => a.includes(ne.symbol)), K = F.length > 0 ? F : r;
    return K.some((ne) => ne.symbol === xe.symbol) ? K : [...K, xe];
  }, [r, a]), R = ot(u, h), I = R < 0.01 ? 0.01 : R, U = T ? "Fees: calculated after deposit" : `Fees: $${I.toFixed(2)} total`, ee = T ? "" : Is(u, h, R), pe = T || h > 0, re = Fs(B ? Se : t, u, s), Q = re ? h / re : null, D = Q ? _s(Q, t.symbol) : null;
  return _(() => {
    if (n === "multi-token")
      if (B && t.symbol !== "SOL") {
        L(t);
        const F = r.find((K) => K.symbol === "SOL");
        F && f(F);
      } else !B && S && t.symbol === "SOL" && (f(S), L(null));
  }, [B, t.symbol, n, r, f, S, t]), _(() => {
    g(h);
  }, [h, g]), l ? /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    n === "multi-token" && !B && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        o.map((F) => {
          const K = r.find((ne) => ne.symbol === F), se = t.symbol === F;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${se ? "is-active" : ""}`,
              onClick: () => {
                K && (v(!1), f(K));
              },
              disabled: !K,
              children: [
                K?.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: K.logoUrl,
                    alt: `${F} logo`
                  }
                ),
                F
              ]
            },
            F
          );
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${b ? "is-active" : ""}`,
            onClick: () => {
              v(!0), A((F) => F + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      b && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        Ls,
        {
          tokens: M,
          selectedToken: t,
          onSelect: f,
          openSignal: P
        }
      ) })
    ] }),
    !T && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ e(
        Bs,
        {
          config: u,
          valueUsd: h,
          onChange: y,
          maxUsd: Rs
        }
      )
    ] }),
    T && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: T ? "Send any token to this address" : `Send ${D ?? "--"} ${B ? "SOL" : t.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ e("code", { className: "cedros-deposit-flow-address", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: m,
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
          U,
          !T && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${N ? "is-open" : ""}`,
              "data-tooltip": ee,
              "aria-label": `Fee breakdown: ${ee.replaceAll(`
`, ", ")}`,
              "aria-expanded": N,
              onClick: (F) => {
                F.stopPropagation(), E((K) => !K);
              },
              onBlur: () => E(!1),
              onKeyDown: (F) => {
                F.key === "Escape" && E(!1);
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
          onClick: p,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: w,
          disabled: !pe,
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
function Ti({ token: t, depositAddress: r, copied: o, feeLine: a, onCopy: s }) {
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
                onClick: s,
                title: "Copy address",
                children: o ? "✓" : "⧉"
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
function Bi({ result: t, config: r, onNewDeposit: o }) {
  const a = t.token ?? Se, s = a.symbol === "SOL" && r.solPriceUsd > 0 ? t.amount * r.solPriceUsd : t.amount, n = ot(r, s), l = Math.max(s - n, 0), c = n < 0.01 ? 0.01 : n;
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
          s.toFixed(2)
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
        onClick: o,
        children: "Make Another Deposit"
      }
    ) })
  ] });
}
function Ri({ error: t, onRetry: r, onCancel: o }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-error-icon", children: "✕" }),
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Failed" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-error-message", children: t }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: o,
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
const Ii = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", Di = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ui = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Fi = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", _i = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Wi = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Oi = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", qi = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", ji = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e", zi = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Gt
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Wi
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: ji
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: Ui
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: qi
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: _i
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Oi
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: Di
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: Ii
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Fi
  }
];
function Ws() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), n = q(() => t ? new ae({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = x(() => {
    s(null);
  }, []), c = x(async () => {
    if (!n)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return await n.get("/credits/balance/sol");
    } catch (m) {
      const f = W(m, "Failed to fetch credit balance");
      throw s(f.message), f;
    } finally {
      o(!1);
    }
  }, [n]), d = x(async () => {
    if (!n)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return (await n.get("/credits/balance")).balances;
    } catch (m) {
      const f = W(m, "Failed to fetch credit balances");
      throw s(f.message), f;
    } finally {
      o(!1);
    }
  }, [n]), u = x(
    async (m) => {
      if (!n)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const f = new URLSearchParams();
        m?.currency && f.set("currency", m.currency), m?.limit && f.set("limit", m.limit.toString()), m?.offset && f.set("offset", m.offset.toString());
        const g = f.toString(), w = g ? `/credits/history?${g}` : "/credits/history";
        return await n.get(w);
      } catch (f) {
        const g = W(f, "Failed to fetch transaction history");
        throw s(g.message), g;
      } finally {
        o(!1);
      }
    },
    [n]
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
function zc({
  showAllCurrencies: t = !1,
  refreshInterval: r = 0,
  compact: o = !1,
  className: a = "",
  onLoad: s
}) {
  const { getBalance: n, getAllBalances: l, isLoading: c, error: d, clearError: u } = Ws(), [m, f] = k([]), [g, w] = k(null), p = x(async () => {
    try {
      if (t) {
        const h = await l();
        f(h), s?.(h);
      } else {
        const h = await n();
        f([h]), s?.([h]);
      }
      w(null);
    } catch (h) {
      w(h instanceof Error ? h.message : "Failed to load balance");
    }
  }, [t, n, l, s]);
  if (_(() => {
    p();
  }, [p]), _(() => {
    if (r <= 0) return;
    const h = setInterval(p, r);
    return () => clearInterval(h);
  }, [r, p]), g || d)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-error", children: g || d }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            u(), w(null), p();
          },
          children: "Retry"
        }
      )
    ] });
  if (c && m.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (o) {
    const h = m[0];
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${a}`, children: [
      h ? /* @__PURE__ */ e(
        "span",
        {
          className: "cedros-credit-value",
          title: `${h.balanceLamports} lamports`,
          children: h.display
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
          onClick: p,
          disabled: c,
          title: "Refresh balance",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    m.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-credit-list", children: m.map((h) => /* @__PURE__ */ i("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-currency", children: h.currency }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-amount", children: h.display })
    ] }, h.currency)) })
  ] });
}
const Dt = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function Vi(t, r) {
  const o = t < 0, a = Math.abs(t), s = r.toUpperCase() === "SOL", l = a / Math.pow(10, s ? 9 : 6), c = o ? "-" : "+";
  return s ? `${c}${l.toFixed(4)} SOL` : `${c}$${l.toFixed(2)}`;
}
function Hi(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = o.getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const n = Math.floor(a / 36e5);
    if (n === 0) {
      const l = Math.floor(a / 6e4);
      return l < 1 ? "Just now" : `${l}m ago`;
    }
    return `${n}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== o.getFullYear() ? "numeric" : void 0
  });
}
function Qi(t) {
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
function Ki(t, r) {
  const o = (t || "").toLowerCase();
  return o === "deposit" ? "↓" : o === "spend" || o === "usage" || o === "charge" ? "↑" : o === "refund" ? "←" : o === "bonus" || o === "credit" ? "★" : r ? "+" : "−";
}
function Vc({
  defaultTab: t = "all",
  pageSize: r = 10,
  refreshInterval: o = 0,
  className: a = "",
  onLoad: s,
  onTransactionClick: n
}) {
  const { getHistory: l, isLoading: c, error: d, clearError: u } = Ws(), [m, f] = k(t), [g, w] = k([]), [p, h] = k(0), [y, b] = k(0), [v, N] = k(null), E = Dt.find((M) => M.key === m) || Dt[0], P = q(() => E.txTypes === null ? g : g.filter((M) => {
    const R = M.txType || "";
    return E.txTypes.some((I) => R.toLowerCase().includes(I.toLowerCase()));
  }), [g, E.txTypes]), A = x(async () => {
    try {
      const M = await l({ limit: r * 3, offset: y });
      w(M.transactions), h(M.total), s?.(M), N(null);
    } catch (M) {
      N(M instanceof Error ? M.message : "Failed to load history");
    }
  }, [r, y, l, s]);
  _(() => {
    b(0);
  }, [m]), _(() => {
    A();
  }, [A]), _(() => {
    if (o <= 0) return;
    const M = setInterval(A, o);
    return () => clearInterval(M);
  }, [o, A]);
  const S = Math.ceil(p / r), L = Math.floor(y / r) + 1, C = (M) => {
    const R = (M - 1) * r;
    b(Math.max(0, Math.min(R, Math.max(0, p - 1))));
  }, B = (M) => {
    f(M);
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
            u(), N(null), A();
          },
          children: "Retry"
        }
      )
    ] });
  if (c && g.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const T = (M) => M.txTypes === null ? g.length : g.filter((R) => {
    const I = R.txType || "";
    return M.txTypes.some((U) => I.toLowerCase().includes(U.toLowerCase()));
  }).length;
  return /* @__PURE__ */ i("div", { className: `cedros-tx-history ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: A,
          disabled: c,
          title: "Refresh",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-tx-tabs", children: Dt.map((M) => {
      const R = T(M), I = m === M.key;
      return /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${I ? "cedros-tx-tab-active" : ""}`,
          onClick: () => B(M.key),
          children: [
            M.label,
            R > 0 && /* @__PURE__ */ e("span", { className: "cedros-tx-tab-count", children: R })
          ]
        },
        M.key
      );
    }) }),
    P.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: m === "all" ? "No transactions yet." : `No ${E.label.toLowerCase()} found.` }),
      m === "all" && /* @__PURE__ */ e("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ i($, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: P.slice(0, r).map((M) => {
        const R = M.amountLamports >= 0;
        return /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-tx-item ${R ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => n?.(M),
            onKeyDown: (I) => {
              (I.key === "Enter" || I.key === " ") && (I.preventDefault(), n?.(M));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `cedros-tx-icon ${R ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: Ki(M.txType, R)
                }
              ),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-type", children: Qi(M.txType) }),
                  /* @__PURE__ */ e(
                    "span",
                    {
                      className: `cedros-tx-amount ${R ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: Vi(M.amountLamports, M.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-description", children: M.description }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: Hi(M.createdAt) })
                ] })
              ] })
            ]
          },
          M.id
        );
      }) }),
      S > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => C(L - 1),
            disabled: L <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          L,
          " of ",
          S
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => C(L + 1),
            disabled: L >= S,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Os() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), [n, l] = k(null), c = q(() => t ? new ae({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = x(() => {
    s(null);
  }, []), u = x(async () => {
    if (!c)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await c.get("/wallet/withdraw/balances");
    } catch (w) {
      const p = W(w, "Failed to fetch wallet balances");
      throw s(p.message), p;
    }
  }, [c]), m = x(
    async (w, p) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const h = await c.post("/wallet/withdraw/sol", {
          destination: w,
          amount_lamports: p
        });
        return l(h), h;
      } catch (h) {
        const y = W(h, "Failed to withdraw SOL");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [c]
  ), f = x(
    async (w, p, h) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const y = await c.post("/wallet/withdraw/spl", {
          destination: w,
          token_mint: p,
          amount: h
        });
        return l(y), y;
      } catch (y) {
        const b = W(y, "Failed to withdraw token");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [c]
  ), g = x(
    async (w = 10, p = 0) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const h = Math.max(1, Math.min(100, Math.trunc(w))), y = Math.max(0, Math.trunc(p)), b = new URLSearchParams({
          limit: String(h),
          offset: String(y)
        });
        return await c.get(
          `/wallet/withdraw/history?${b}`
        );
      } catch (h) {
        const y = W(h, "Failed to fetch withdrawal history");
        throw s(y.message), y;
      }
    },
    [c]
  );
  return {
    withdrawSol: m,
    withdrawSpl: f,
    getBalances: u,
    getHistory: g,
    isSubmitting: r,
    error: a,
    clearError: d,
    lastResult: n
  };
}
const Ut = "So11111111111111111111111111111111111111112", Yi = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr: "EURC",
  USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB: "USD1",
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": "PYUSD",
  USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX: "USDH",
  CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT: "CASH",
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: "BONK",
  oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp: "ORE"
};
function $i(t) {
  return t.length < 32 || t.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(t);
}
function Ft(t) {
  return t.length <= 16 ? t : `${t.slice(0, 6)}...${t.slice(-6)}`;
}
function ze(t, r) {
  return (Number(t) / Math.pow(10, r)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(r, 6)
  });
}
function Hc({
  onSuccess: t,
  onError: r,
  onCancel: o,
  className: a = ""
}) {
  const s = ve(), { withdrawSol: n, withdrawSpl: l, getBalances: c, isSubmitting: d, error: u, clearError: m } = Os(), [f, g] = k("loading"), [w, p] = k([]), [h, y] = k(null), [b, v] = k(""), [N, E] = k(""), [P, A] = k(null), [S, L] = k(null), [C, B] = k(null), T = s?.config.solana?.network ?? "mainnet-beta", M = q(() => {
    if (!P?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${P.txSignature}`;
    return T === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(T)}`;
  }, [P, T]), R = q(() => {
    if (!h || !N) return "0";
    const D = parseFloat(N);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, h.decimals)).toString();
  }, [N, h]);
  _(() => {
    if (!s) return;
    let D = !1;
    return (async () => {
      try {
        const F = await c();
        if (D) return;
        const K = [];
        F.solLamports > 0 && K.push({
          symbol: "SOL",
          mint: Ut,
          decimals: 9,
          rawBalance: String(F.solLamports),
          displayBalance: ze(String(F.solLamports), 9)
        });
        for (const se of F.tokens) {
          const ne = Yi[se.mint] ?? Ft(se.mint);
          K.push({
            symbol: ne,
            mint: se.mint,
            decimals: se.decimals,
            rawBalance: se.amount,
            displayBalance: ze(se.amount, se.decimals)
          });
        }
        p(K), g((K.length > 0, "select"));
      } catch {
        D || (B("Failed to load wallet balances"), g("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [s, c]);
  const I = x(
    (D) => {
      y(D), g("form"), m(), L(null), E("");
    },
    [m]
  ), U = x(() => {
    if (!h) return;
    const D = Number(h.rawBalance) / Math.pow(10, h.decimals);
    h.mint === Ut ? E(String(Math.max(0, D - 0.01))) : E(String(D));
  }, [h]), ee = x(() => {
    if (L(null), !b.trim()) {
      L("Destination address is required");
      return;
    }
    if (!$i(b.trim())) {
      L("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      L("Please enter a valid amount");
      return;
    }
    if (R === "0") {
      L("Amount is too small");
      return;
    }
    g("confirm");
  }, [b, N, R]), pe = x(async () => {
    if (h) {
      g("processing"), m();
      try {
        let D;
        h.mint === Ut ? D = await n(b.trim(), Number(R)) : D = await l(b.trim(), h.mint, R), A(D), g("success"), t?.(D);
      } catch (D) {
        g("confirm"), r?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    h,
    b,
    R,
    n,
    l,
    m,
    t,
    r
  ]), re = x(() => {
    m(), L(null), f === "form" ? (g("select"), y(null), E(""), v("")) : f === "confirm" && g("form");
  }, [f, m]), Q = x(() => {
    g("select"), y(null), v(""), E(""), A(null), m(), L(null);
  }, [m]);
  return s ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal ${a}`, children: [
    f === "loading" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ e(j, {}),
      /* @__PURE__ */ e("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    f === "select" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ e("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      C && /* @__PURE__ */ e(X, { error: C }),
      w.length === 0 && !C && /* @__PURE__ */ e("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ e("div", { className: "cedros-withdrawal-tokens", children: w.map((D) => /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => I(D),
          children: [
            /* @__PURE__ */ e("span", { className: "cedros-withdrawal-token-symbol", children: D.symbol }),
            /* @__PURE__ */ e("span", { className: "cedros-withdrawal-token-balance", children: D.displayBalance })
          ]
        },
        D.mint
      )) }),
      o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-ghost cedros-withdrawal-cancel",
          onClick: o,
          children: "Cancel"
        }
      )
    ] }),
    f === "form" && h && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: re,
            children: "Back"
          }
        ),
        /* @__PURE__ */ i("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          h.symbol
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        h.displayBalance,
        " ",
        h.symbol
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ e("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-destination", children: "Destination Address" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "cedros-withdrawal-destination",
            type: "text",
            className: "cedros-input",
            placeholder: "Solana address (base58)",
            value: b,
            onChange: (D) => v(D.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ i("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          h.symbol,
          ")"
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-amount-row", children: [
          /* @__PURE__ */ e(
            "input",
            {
              id: "cedros-withdrawal-amount",
              type: "number",
              className: "cedros-input",
              placeholder: "0.00",
              value: N,
              onChange: (D) => E(D.target.value),
              min: "0",
              step: "any"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: U,
              children: "Max"
            }
          )
        ] })
      ] }),
      (S || u) && /* @__PURE__ */ e(X, { error: S || u || "" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: ee,
          children: "Review Withdrawal"
        }
      )
    ] }),
    f === "confirm" && h && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: re,
            disabled: d,
            children: "Back"
          }
        ),
        /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", children: h.symbol })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ i("span", { className: "cedros-withdrawal-summary-value", children: [
            ze(R, h.decimals),
            " ",
            h.symbol
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", title: b, children: Ft(b) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      u && /* @__PURE__ */ e(X, { error: u }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: re,
            disabled: d,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: pe,
            disabled: d,
            children: d ? "Sending..." : "Confirm & Send"
          }
        )
      ] })
    ] }),
    f === "processing" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ e(j, {}),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        h?.symbol,
        "..."
      ] })
    ] }),
    f === "success" && P && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ e("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-subtitle", children: [
        ze(R, h?.decimals ?? 9),
        " ",
        h?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ e("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ e(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: M,
            target: "_blank",
            rel: "noreferrer",
            children: Ft(P.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-withdrawal-done",
          onClick: Q,
          children: "Done"
        }
      )
    ] })
  ] }) : null;
}
function Gi(t, r) {
  if (t === "sol") return "SOL";
  if (!r) return "SPL";
  const o = zi.find((a) => a.mint === r);
  return o ? o.symbol : `${r.slice(0, 4)}...${r.slice(-4)}`;
}
function Ji(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function Xi(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = o.getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const n = Math.floor(a / 36e5);
    if (n === 0) {
      const l = Math.floor(a / 6e4);
      return l < 1 ? "Just now" : `${l}m ago`;
    }
    return `${n}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== o.getFullYear() ? "numeric" : void 0
  });
}
function Qc({
  pageSize: t = 10,
  className: r = "",
  onTransactionClick: o,
  explorerUrl: a = "https://solscan.io"
}) {
  const { getHistory: s, error: n, clearError: l } = Os(), [c, d] = k([]), [u, m] = k(0), [f, g] = k(0), [w, p] = k(!1), [h, y] = k(null), b = x(async () => {
    p(!0);
    try {
      const P = await s(t, f);
      d(P.items), m(P.total), y(null);
    } catch (P) {
      y(P instanceof Error ? P.message : "Failed to load withdrawal history");
    } finally {
      p(!1);
    }
  }, [t, f, s]);
  _(() => {
    b();
  }, [b]);
  const v = Math.ceil(u / t), N = Math.floor(f / t) + 1, E = (P) => {
    const A = (P - 1) * t;
    g(Math.max(0, Math.min(A, Math.max(0, u - 1))));
  };
  return h || n ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${r}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-withdrawal-error", children: h || n }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          l(), y(null), b();
        },
        children: "Retry"
      }
    )
  ] }) : w && c.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${r}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-tx-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-tx-loading-text", children: "Loading withdrawal history..." })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history ${r}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-tx-title", children: "Withdrawal History" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: b,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    c.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ i($, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: c.map((P) => {
        const A = Gi(P.tokenType, P.tokenMint);
        return /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => o?.(P),
            onKeyDown: (S) => {
              (S.key === "Enter" || S.key === " ") && (S.preventDefault(), o?.(P));
            },
            role: o ? "button" : void 0,
            tabIndex: o ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ i("span", { className: "cedros-tx-type", children: [
                    A,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ i("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: [
                    P.amount,
                    " ",
                    A === "SOL" ? "lamports" : ""
                  ] })
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ i("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ e(
                      "a",
                      {
                        href: `${a}/account/${P.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (S) => S.stopPropagation(),
                        children: Ji(P.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ e(
                      "a",
                      {
                        href: `${a}/tx/${P.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (S) => S.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: Xi(P.createdAt) })
                ] })
              ] })
            ]
          },
          P.id
        );
      }) }),
      v > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => E(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          N,
          " of ",
          v
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => E(N + 1),
            disabled: N >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Kc({
  brandLogo: t,
  brandName: r,
  title: o = "Welcome back",
  subtitle: a = "Login with your Apple or Google account",
  termsText: s,
  onSuccess: n,
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
        /* @__PURE__ */ e("h1", { className: "cedros-full-page-title", children: o }),
        a && /* @__PURE__ */ e("p", { className: "cedros-full-page-subtitle", children: a })
      ] }),
      c ?? /* @__PURE__ */ e(Kt, { defaultTab: l, onSuccess: n })
    ] }),
    s && /* @__PURE__ */ e("p", { className: "cedros-terms-footer", children: s })
  ] });
}
function Yc({
  brandName: t = "Your Brand",
  brandLogo: r,
  tagline: o = "Your tagline goes here. Make it compelling.",
  title: a = "Sign in",
  subtitle: s = "Enter your credentials to access your account",
  onSuccess: n,
  defaultTab: l = "login",
  children: c,
  className: d = ""
}) {
  return /* @__PURE__ */ i("div", { className: `cedros-split-page-layout ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-split-page-brand", children: /* @__PURE__ */ i("div", { className: "cedros-split-page-brand-content", children: [
      r ?? /* @__PURE__ */ e("div", { className: "cedros-split-page-logo", children: t.charAt(0).toUpperCase() }),
      /* @__PURE__ */ e("h1", { className: "cedros-split-page-brand-name", children: t }),
      o && /* @__PURE__ */ e("p", { className: "cedros-split-page-tagline", children: o })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "cedros-split-page-form", children: /* @__PURE__ */ i("div", { className: "cedros-split-page-form-content", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-split-page-title", children: a }),
      s && /* @__PURE__ */ e("p", { className: "cedros-split-page-subtitle", children: s }),
      c ?? /* @__PURE__ */ e(Kt, { defaultTab: l, onSuccess: n })
    ] }) })
  ] });
}
function $c() {
  const { config: t, _internal: r } = te(), [o, a] = k({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), s = q(
    () => new Eo(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      r?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), n = x(
    async (d) => {
      a((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await s.authorize(d), m = {
          allowed: u.allowed,
          reason: u.reason,
          isLoading: !1,
          error: null
        };
        return a(m), m;
      } catch (u) {
        const m = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: u
        };
        return a(m), m;
      }
    },
    [s]
  ), l = x(
    async (d) => (await n(d)).allowed,
    [n]
  ), c = x(() => {
    a({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: l,
    lastCheck: o,
    clearCheck: c,
    checkAuthorization: n
  };
}
function Gc() {
  const { listAllWallets: t, createDerivedWallet: r, deleteDerivedWallet: o } = Pe(), [a, s] = k([]), [n, l] = k(!1), [c, d] = k(null), u = x(async () => {
    l(!0), d(null);
    try {
      const w = await t();
      s(w.wallets);
    } catch (w) {
      const p = w instanceof Error ? w.message : "Failed to list wallets";
      d(p);
    } finally {
      l(!1);
    }
  }, [t]), m = x(
    async (w) => {
      l(!0), d(null);
      try {
        const p = await r({ label: w });
        return await u(), p;
      } catch (p) {
        const h = p instanceof Error ? p.message : "Failed to create wallet";
        throw d(h), p;
      } finally {
        l(!1);
      }
    },
    [r, u]
  ), f = x(
    async (w) => {
      l(!0), d(null);
      try {
        await o(w), await u();
      } catch (p) {
        const h = p instanceof Error ? p.message : "Failed to delete wallet";
        throw d(h), p;
      } finally {
        l(!1);
      }
    },
    [o, u]
  ), g = x(() => d(null), []);
  return {
    wallets: a,
    isLoading: n,
    createWallet: m,
    deleteWallet: f,
    refresh: u,
    error: c,
    clearError: g
  };
}
function Jc() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), [n, l] = k(null), c = q(() => t ? new ae({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = x(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      const f = await c.get("/wallet/pending-recovery");
      l(f);
    } catch (f) {
      const g = W(f, "Failed to fetch pending recovery");
      throw s(g.message), g;
    } finally {
      o(!1);
    }
  }, [c]), u = x(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      const f = { confirmed: !0 };
      await c.post("/wallet/acknowledge-recovery", f), l(null);
    } catch (f) {
      const g = W(f, "Failed to acknowledge recovery");
      throw s(g.message), g;
    } finally {
      o(!1);
    }
  }, [c]), m = x(() => s(null), []);
  return _(() => {
    c && t?.authState === "authenticated" && d().catch(() => {
    });
  }, [c, t?.authState, d]), {
    hasPendingRecovery: n?.hasPendingRecovery ?? !1,
    recoveryType: n?.recoveryType ?? null,
    recoveryPhrase: n?.recoveryPhrase ?? null,
    expiresAt: n?.expiresAt ? new Date(n.expiresAt) : null,
    fetchPendingRecovery: d,
    acknowledgeRecovery: u,
    isLoading: r,
    error: a,
    clearError: m
  };
}
function Xc(t = {}) {
  const { onExternalSign: r } = t, { solanaPubkey: o, hasExternalWallet: a, status: s, isUnlocked: n } = tt(), {
    signTransaction: l,
    isSigning: c,
    error: d,
    clearError: u
  } = $n(), m = q(() => a && r ? "external" : s === "enrolled_locked" || s === "enrolled_unlocked" ? "sss" : "none", [a, r, s]), f = m !== "none", g = s === "enrolled_locked" || s === "enrolled_unlocked";
  return {
    signTransaction: x(
      async (p, h) => {
        if (m === "external") {
          if (!r)
            throw new Error("External wallet signing callback not provided");
          return r(p);
        }
        if (m === "sss") {
          if (!h && !n)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return h ? l(p, h) : l(p);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [m, r, n, l]
    ),
    signingMethod: m,
    canSign: f,
    isSigning: c,
    publicKey: o,
    hasExternalWallet: a,
    hasSssWallet: g,
    isSssUnlocked: n,
    error: d,
    clearError: u
  };
}
function Zc() {
  const { config: t, _internal: r } = te(), [o, a] = k(null), [s, n] = k(!1), [l, c] = k(null), d = q(
    () => new ae({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, r]
  ), u = x(async () => {
    n(!0), c(null);
    try {
      await d.post("/welcome-completed", {});
    } catch (f) {
      const g = f instanceof Error ? f : new Error(String(f));
      throw c(g), g;
    } finally {
      n(!1);
    }
  }, [d]), m = x(() => {
    a(null);
  }, []);
  return {
    postLoginAction: o,
    setPostLoginAction: a,
    markWelcomeCompleted: u,
    clearPostLogin: m,
    isLoading: s,
    error: l
  };
}
const Xt = oo(null), jt = {
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
function Zi(t, r) {
  return qs(t, r);
}
function qs(t, r) {
  const o = { ...t };
  for (const a in r)
    if (Object.prototype.hasOwnProperty.call(r, a)) {
      const s = t[a], n = r[a];
      typeof s == "object" && s !== null && typeof n == "object" && n !== null ? o[a] = qs(
        s,
        n
      ) : n !== void 0 && (o[a] = n);
    }
  return o;
}
function el({
  children: t,
  locale: r = "en",
  translations: o
}) {
  const a = q(() => ({ t: o ? Zi(jt, o) : jt, locale: r }), [o, r]);
  return /* @__PURE__ */ e(Xt.Provider, { value: a, children: t });
}
function tl() {
  return $r(Xt)?.t ?? jt;
}
function rl() {
  return $r(Xt)?.locale ?? "en";
}
export {
  Wc as AccountSettings,
  xo as AdminDepositList,
  So as AdminDepositStats,
  Nl as AdminIcons,
  Lo as AdminPrivacyPeriodDeposits,
  Cl as AdminShell,
  Io as AdminUserList,
  To as AdminWithdrawalHistory,
  Mo as AdminWithdrawalQueue,
  Po as AdminWithdrawalStats,
  An as AppleLoginButton,
  Uo as AuthenticationSettings,
  El as CEDROS_LOGIN_SECTION_IDS,
  Rc as CapabilityWarning,
  Fc as CedrosAdminDashboard,
  nl as CedrosLoginProvider,
  qc as CompleteAccountPrompt,
  zc as CreditBalance,
  qo as CreditSystemSettings,
  jc as DepositFlow,
  ao as EmailLoginForm,
  io as EmailRegisterForm,
  Ml as EmailSettings,
  Fo as EmbeddedWalletSettings,
  En as ErrorBoundary,
  X as ErrorMessage,
  wn as ForgotPasswordForm,
  Kc as FullPageLayout,
  co as GoogleLoginButton,
  Vc as History,
  el as I18nProvider,
  go as InviteForm,
  wo as InviteList,
  oi as LinkedAccounts,
  j as LoadingSpinner,
  Pc as LoginButton,
  Kt as LoginForm,
  Lc as LoginModal,
  fo as MemberList,
  Oc as MfaSetupPrompt,
  Tc as OrgSelector,
  Bc as OrgSwitcher,
  Xr as OtpInput,
  Nn as PasskeyLoginButton,
  Jn as PasskeyPrompt,
  he as PasswordInput,
  qo as PrivacyCashSettings,
  Do as ProfileDropdown,
  ri as ProfileTab,
  jn as RecoveryPhraseDisplay,
  zn as RecoveryPhraseInput,
  Mc as ResetPasswordForm,
  zi as SUPPORTED_TOKENS,
  Uc as SecuritySettings,
  jo as ServerSettings,
  Dn as SessionList,
  Ko as SettingsPageLayout,
  Aa as SetupWizard,
  lo as SolanaLoginButton,
  Yc as SplitPageLayout,
  Dc as SystemSettings,
  Bs as TieredAmountSlider,
  Ls as TokenSelector,
  Xa as TotpSettings,
  Ns as TotpSetup,
  hl as TotpVerify,
  _c as UserProfileSettings,
  ua as WalletAddressRow,
  Yn as WalletEnrollment,
  Ic as WalletManager,
  aa as WalletRecovery,
  ha as WalletStatus,
  ta as WalletUnlock,
  Il as WebhookSettings,
  Hc as WithdrawalFlow,
  Qc as WithdrawalHistory,
  Sl as cedrosLoginPlugin,
  jt as defaultTranslations,
  al as getEmbeddedWalletInfo,
  $t as getTierForAmount,
  il as isEmbeddedWalletAvailable,
  xl as loginPlugin,
  Zi as mergeTranslations,
  yl as registerMobileWallet,
  Bl as useAdminDeposits,
  Pl as useAdminShell,
  vl as useAdminUsers,
  bn as useAppleAuth,
  et as useAuth,
  ll as useAuthState,
  dl as useAuthUI,
  $c as useAuthorize,
  te as useCedrosLogin,
  Cs as useCredentials,
  Ws as useCredits,
  fi as useDeposit,
  pl as useEmailAuth,
  gl as useGoogleAuth,
  fn as useInstantLink,
  mo as useInvites,
  rl as useLocale,
  po as useMembers,
  Co as useOrgs,
  Gn as usePasskeySigning,
  Qt as usePasswordReset,
  Jc as usePendingRecovery,
  Zc as usePostLogin,
  st as useProfile,
  uo as useServerFeatures,
  hi as useSessions,
  ws as useSetup,
  bl as useSolanaAuth,
  bo as useSystemSettings,
  ks as useTotp,
  ml as useTotpVerify,
  Xc as useTransactionSigning,
  tl as useTranslations,
  tt as useWallet,
  Kn as useWalletEnrollment,
  Pe as useWalletMaterial,
  na as useWalletRecovery,
  $n as useWalletSigning,
  Gc as useWallets,
  fs as useWebAuthn,
  Os as useWithdrawal,
  rt as validatePassword
};
