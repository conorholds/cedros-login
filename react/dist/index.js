import { f as ze, h as Ds, u as Br, i as Is, j as Us, k as Me, w as Rr, g as Fs, b as Dr, t as Ir, c as ge, a as Ur, D as Ve, l as Fr, r as Ws, m as It, n as Wr, o as Os, p as Or, q as Xe } from "./useAuth-C3dpk0po.js";
import { C as Ol, x as ql, s as jl } from "./useAuth-C3dpk0po.js";
import { u as ne, A as ue, h as q, a as ve } from "./useCedrosLogin-_94MmGGq.js";
import { b as Vl, c as Hl } from "./useCedrosLogin-_94MmGGq.js";
import { jsx as e, jsxs as i, Fragment as X } from "react/jsx-runtime";
import { useState as k, useRef as $, useMemo as O, useEffect as F, useCallback as C, useId as qr, Component as qs, createContext as js, useContext as jr } from "react";
import { L as K } from "./LoadingSpinner-6vml-zwr.js";
import { a as zr, s as zs } from "./sanitization-CQ-H1MSg.js";
import { b as Vs, E as Hs, a as Qs, P as we, O as Vr } from "./EmailRegisterForm-nI0BOIxR.js";
import { T as Yl, u as Kl, c as Gl, d as $l } from "./EmailRegisterForm-nI0BOIxR.js";
import { b as Ys, v as Ut } from "./validation-B8kMV3BL.js";
import { E as ee } from "./ErrorMessage-CcEK0pYO.js";
import { G as Ks } from "./GoogleLoginButton-CXwp4LsQ.js";
import { u as Xl } from "./GoogleLoginButton-CXwp4LsQ.js";
import { d as Jt, S as Gs } from "./SolanaLoginButton-P22QjBaO.js";
import { u as ec } from "./SolanaLoginButton-P22QjBaO.js";
import { c as $s, d as Js, u as Xs, a as Zs, M as eo, I as to, b as ro, P as so } from "./PermissionsSection-CighC1p6.js";
import { u as oo } from "./useSystemSettings-DBlAMjFi.js";
import { u as no, O as ao } from "./useOrgs-C3pzMA9h.js";
import { A as io, a as lo } from "./AdminDepositList-CyT4VBH8.js";
import { A as co, a as uo, b as ho, c as po } from "./AdminWithdrawalHistory-Cud-yuWy.js";
import { u as mo, A as fo, a as go } from "./useUsersStatsSummary-NjEFvWuz.js";
import { b as rc } from "./useUsersStatsSummary-NjEFvWuz.js";
import { S as Hr } from "./StatsBar-BX-hHtTq.js";
import { P as wo } from "./plugin-D1NdppqC.js";
import { I as oc, A as nc, c as ac, c as ic, u as lc } from "./plugin-D1NdppqC.js";
import { A as yo } from "./AuthenticationSettings-vowmQPXz.js";
import { E as bo } from "./EmbeddedWalletSettings-BInZvFZf.js";
import { u as Ao, A as vo, S as ko } from "./AutosaveStatus-Ciyt350A.js";
import { C as No } from "./CreditSystemSettings-BQ3h4CyM.js";
import { S as Co } from "./ServerSettings-BE8fsE5k.js";
import { b as Eo, c as So, s as Qr, g as Yr, p as Kr, a as Gr, d as xo, e as Po } from "./shamir-L-s-Tp1Z.js";
import { u as dc } from "./useAdminDeposits-BTSyeAfg.js";
import { S as To } from "./SettingsPageLayout--GZ_iHLc.js";
import { E as hc } from "./EmailSettings-CCA8dNCi.js";
import { W as mc } from "./WebhookSettings-kIstSjZi.js";
function He(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function $r(t, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : t ? r.every((o) => typeof o == "string") : r.every((o) => Number.isSafeInteger(o)) : !1;
}
function Lo(t) {
  if (typeof t != "function")
    throw new Error("function expected");
  return !0;
}
function Qe(t, r) {
  if (typeof r != "string")
    throw new Error(`${t}: string expected`);
  return !0;
}
function Pe(t) {
  if (!Number.isSafeInteger(t))
    throw new Error(`invalid integer: ${t}`);
}
function Ye(t) {
  if (!Array.isArray(t))
    throw new Error("array expected");
}
function Ke(t, r) {
  if (!$r(!0, r))
    throw new Error(`${t}: array of strings expected`);
}
function Jr(t, r) {
  if (!$r(!1, r))
    throw new Error(`${t}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function _o(...t) {
  const r = (n) => n, o = (n, c) => (l) => n(c(l)), a = t.map((n) => n.encode).reduceRight(o, r), s = t.map((n) => n.decode).reduce(o, r);
  return { encode: a, decode: s };
}
// @__NO_SIDE_EFFECTS__
function Mo(t) {
  const r = typeof t == "string" ? t.split("") : t, o = r.length;
  Ke("alphabet", r);
  const a = new Map(r.map((s, n) => [s, n]));
  return {
    encode: (s) => (Ye(s), s.map((n) => {
      if (!Number.isSafeInteger(n) || n < 0 || n >= o)
        throw new Error(`alphabet.encode: digit index outside alphabet "${n}". Allowed: ${t}`);
      return r[n];
    })),
    decode: (s) => (Ye(s), s.map((n) => {
      Qe("alphabet.decode", n);
      const c = a.get(n);
      if (c === void 0)
        throw new Error(`Unknown letter: "${n}". Allowed: ${t}`);
      return c;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function Bo(t = "") {
  return Qe("join", t), {
    encode: (r) => (Ke("join.decode", r), r.join(t)),
    decode: (r) => (Qe("join.decode", r), r.split(t))
  };
}
// @__NO_SIDE_EFFECTS__
function Ro(t, r = "=") {
  return Pe(t), Qe("padding", r), {
    encode(o) {
      for (Ke("padding.encode", o); o.length * t % 8; )
        o.push(r);
      return o;
    },
    decode(o) {
      Ke("padding.decode", o);
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
function Mt(t, r, o) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (o < 2)
    throw new Error(`convertRadix: invalid to=${o}, base cannot be less than 2`);
  if (Ye(t), !t.length)
    return [];
  let a = 0;
  const s = [], n = Array.from(t, (l) => {
    if (Pe(l), l < 0 || l >= r)
      throw new Error(`invalid integer: ${l}`);
    return l;
  }), c = n.length;
  for (; ; ) {
    let l = 0, d = !0;
    for (let u = a; u < c; u++) {
      const p = n[u], f = r * l, h = f + p;
      if (!Number.isSafeInteger(h) || f / r !== l || h - p !== f)
        throw new Error("convertRadix: carry overflow");
      const w = h / o;
      l = h % o;
      const g = Math.floor(w);
      if (n[u] = g, !Number.isSafeInteger(g) || g * o + l !== h)
        throw new Error("convertRadix: carry overflow");
      if (d)
        g ? d = !1 : a = u;
      else continue;
    }
    if (s.push(l), d)
      break;
  }
  for (let l = 0; l < t.length - 1 && t[l] === 0; l++)
    s.push(0);
  return s.reverse();
}
const Xr = (t, r) => r === 0 ? t : Xr(r, t % r), Ge = /* @__NO_SIDE_EFFECTS__ */ (t, r) => t + (r - Xr(t, r)), nt = /* @__PURE__ */ (() => {
  let t = [];
  for (let r = 0; r < 40; r++)
    t.push(2 ** r);
  return t;
})();
function Bt(t, r, o, a) {
  if (Ye(t), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (o <= 0 || o > 32)
    throw new Error(`convertRadix2: wrong to=${o}`);
  if (/* @__PURE__ */ Ge(r, o) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${o} carryBits=${/* @__PURE__ */ Ge(r, o)}`);
  let s = 0, n = 0;
  const c = nt[r], l = nt[o] - 1, d = [];
  for (const u of t) {
    if (Pe(u), u >= c)
      throw new Error(`convertRadix2: invalid data word=${u} from=${r}`);
    if (s = s << r | u, n + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${n} from=${r}`);
    for (n += r; n >= o; n -= o)
      d.push((s >> n - o & l) >>> 0);
    const p = nt[n];
    if (p === void 0)
      throw new Error("invalid carry");
    s &= p - 1;
  }
  if (s = s << o - n & l, !a && n >= r)
    throw new Error("Excess padding");
  if (!a && s > 0)
    throw new Error(`Non-zero padding: ${s}`);
  return a && n > 0 && d.push(s >>> 0), d;
}
// @__NO_SIDE_EFFECTS__
function Do(t) {
  Pe(t);
  const r = 2 ** 8;
  return {
    encode: (o) => {
      if (!He(o))
        throw new Error("radix.encode input should be Uint8Array");
      return Mt(Array.from(o), r, t);
    },
    decode: (o) => (Jr("radix.decode", o), Uint8Array.from(Mt(o, t, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function Io(t, r = !1) {
  if (Pe(t), t <= 0 || t > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Ge(8, t) > 32 || /* @__PURE__ */ Ge(t, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (o) => {
      if (!He(o))
        throw new Error("radix2.encode input should be Uint8Array");
      return Bt(Array.from(o), 8, t, !r);
    },
    decode: (o) => (Jr("radix2.decode", o), Uint8Array.from(Bt(o, t, 8, r)))
  };
}
function Uo(t, r) {
  return Pe(t), Lo(r), {
    encode(o) {
      if (!He(o))
        throw new Error("checksum.encode: input should be Uint8Array");
      const a = r(o).slice(0, t), s = new Uint8Array(o.length + t);
      return s.set(o), s.set(a, o.length), s;
    },
    decode(o) {
      if (!He(o))
        throw new Error("checksum.decode: input should be Uint8Array");
      const a = o.slice(0, -t), s = o.slice(-t), n = r(a).slice(0, t);
      for (let c = 0; c < t; c++)
        if (n[c] !== s[c])
          throw new Error("Invalid checksum");
      return a;
    }
  };
}
const Fe = {
  alphabet: Mo,
  chain: _o,
  checksum: Uo,
  convertRadix: Mt,
  convertRadix2: Bt,
  radix: Do,
  radix2: Io,
  join: Bo,
  padding: Ro
};
const Fo = (t) => t[0] === "あいこくしん";
function Wo(t) {
  if (typeof t != "string")
    throw new TypeError("invalid mnemonic type: " + typeof t);
  return t.normalize("NFKD");
}
function Oo(t) {
  const r = Wo(t), o = r.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: r, words: o };
}
function Zr(t) {
  Eo(t, 16, 20, 24, 28, 32);
}
const qo = (t) => {
  const r = 8 - t.length / 4;
  return new Uint8Array([So(t)[0] >> r << r]);
};
function es(t) {
  if (!Array.isArray(t) || t.length !== 2048 || typeof t[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return t.forEach((r) => {
    if (typeof r != "string")
      throw new Error("wordlist: non-string element: " + r);
  }), Fe.chain(Fe.checksum(1, qo), Fe.radix2(11, !0), Fe.alphabet(t));
}
function Ft(t, r) {
  const { words: o } = Oo(t), a = es(r).decode(o);
  return Zr(a), a;
}
function ts(t, r) {
  return Zr(t), es(r).encode(t).join(Fo(r) ? "　" : " ");
}
function Wt(t, r) {
  try {
    Ft(t, r);
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
function jo(t) {
  if (t.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${t.length}`);
  const o = ts(t, ye).split(" ");
  if (o.length !== le)
    throw new Error(`Unexpected word count: expected ${le}, got ${o.length}`);
  return o;
}
function zo(t) {
  if (t.length !== le)
    throw new Error(`Invalid word count: expected ${le}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!Wt(r, ye))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const o = Ft(r, ye);
  if (o.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${o.length}`);
  return ze(o);
}
function Vo(t) {
  if (t.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${t.length}`);
  const o = ts(t, ye).split(" ");
  if (o.length !== le)
    throw new Error(`Unexpected word count: expected ${le}, got ${o.length}`);
  return o;
}
function Ho(t) {
  if (t.length !== le)
    throw new Error(`Invalid word count: expected ${le}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!Wt(r, ye))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const o = Ft(r, ye);
  if (o.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${o.length}`);
  return Ds(o);
}
function rs(t) {
  if (t.length !== le)
    return !1;
  const r = t.join(" ").toLowerCase().trim();
  return Wt(r, ye);
}
function We(t) {
  return ye.includes(t.toLowerCase().trim());
}
function Qo(t, r = 5) {
  const o = t.toLowerCase().trim();
  return o.length === 0 ? [] : ye.filter((a) => a.startsWith(o)).slice(0, r);
}
function Yo(t) {
  const r = [];
  for (let o = 0; o < t.length; o += 4)
    r.push(t.slice(o, o + 4));
  return r;
}
function Ko(t) {
  return t.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((r) => r.trim()).filter((r) => r.length > 0);
}
function ul({
  className: t = "",
  variant: r = "default",
  size: o = "md",
  children: a,
  menuItems: s = [],
  hideSignOut: n = !1
}) {
  const { user: c, isAuthenticated: l, isLoading: d, openLoginModal: u, logout: p } = Br(), [f, h] = k(!1), [w, g] = k(-1), m = $(null), b = $(null), v = O(
    () => [...s, ...n ? [] : [{ label: "Sign out", onClick: p }]],
    [s, n, p]
  );
  F(() => {
    if (!f) return;
    const A = (P) => {
      m.current && !m.current.contains(P.target) && (h(!1), g(-1));
    }, S = (P) => {
      P.key === "Escape" && (h(!1), g(-1), b.current?.focus());
    };
    return document.addEventListener("mousedown", A), document.addEventListener("keydown", S), () => {
      document.removeEventListener("mousedown", A), document.removeEventListener("keydown", S);
    };
  }, [f]);
  const y = C(
    (A) => {
      if (!(!f || v.length === 0))
        switch (A.key) {
          case "ArrowDown":
            A.preventDefault(), g((S) => (S + 1) % v.length);
            break;
          case "ArrowUp":
            A.preventDefault(), g((S) => (S - 1 + v.length) % v.length);
            break;
          case "Home":
            A.preventDefault(), g(0);
            break;
          case "End":
            A.preventDefault(), g(v.length - 1);
            break;
          case "Enter":
          case " ":
            w >= 0 && (A.preventDefault(), v[w].onClick(), h(!1), g(-1));
            break;
        }
    },
    [f, w, v]
  ), N = C(() => {
    v.length !== 0 && (h((A) => !A), g(-1));
  }, [v.length]), E = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, T = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (d)
    return /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-button ${T[r]} ${E[o]} ${t}`,
        disabled: !0,
        children: /* @__PURE__ */ e(K, { size: "sm" })
      }
    );
  if (l && c) {
    const A = c.name || c.email || "User", S = zr(c.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ i("div", { className: "cedros-user-menu", ref: m, onKeyDown: y, children: [
        /* @__PURE__ */ i(
          "button",
          {
            ref: b,
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
          s.map((P, x) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${w === x ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: w === x ? 0 : -1,
              onClick: () => {
                P.onClick(), h(!1);
              },
              children: [
                P.icon && /* @__PURE__ */ e("span", { className: "cedros-dropdown-icon", children: P.icon }),
                P.label
              ]
            },
            x
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
      className: `cedros-button ${T[r]} ${E[o]} ${t}`,
      onClick: u,
      children: a || "Sign in"
    }
  );
}
function ss() {
  const { config: t } = ne(), [r, o] = k(!1), [a, s] = k(!1), [n, c] = k(null), l = O(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), { checkLimit: d, getRemainingAttempts: u } = Vs({
    maxAttempts: 3,
    windowMs: 3e5
  }), p = C(
    async (g) => {
      if (!Ys(g)) {
        const m = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw c(m), m;
      }
      try {
        d();
      } catch (m) {
        const b = {
          code: "RATE_LIMITED",
          message: m instanceof Error ? m.message : "Too many attempts"
        };
        throw c(b), b;
      }
      o(!0), c(null), s(!1);
      try {
        await l.post("/forgot-password", { email: g }), s(!0);
      } catch (m) {
        const b = q(m, "Failed to send reset email");
        throw c(b), b;
      } finally {
        o(!1);
      }
    },
    [l, d]
  ), f = C(
    async (g, m) => {
      o(!0), c(null), s(!1);
      try {
        await l.post("/reset-password", { token: g, newPassword: m }), s(!0);
      } catch (b) {
        const v = q(b, "Failed to reset password");
        throw c(v), v;
      } finally {
        o(!1);
      }
    },
    [l]
  ), h = C(() => c(null), []), w = C(() => {
    c(null), s(!1), o(!1);
  }, []);
  return {
    forgotPassword: p,
    resetPassword: f,
    isLoading: r,
    isSuccess: a,
    error: n,
    clearError: h,
    reset: w,
    remainingAttempts: u()
  };
}
function Go({
  onSuccess: t,
  onCancel: r,
  className: o = ""
}) {
  const [a, s] = k(""), { forgotPassword: n, isLoading: c, isSuccess: l, error: d, clearError: u } = ss(), p = qr(), f = async (h) => {
    h.preventDefault();
    try {
      await n(a), t?.();
    } catch {
    }
  };
  return l ? /* @__PURE__ */ i("div", { className: `cedros-forgot-password-success ${o}`, children: [
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
  ] }) : /* @__PURE__ */ i("form", { className: `cedros-forgot-password-form ${o}`, onSubmit: f, children: [
    /* @__PURE__ */ i("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ e("p", { className: "cedros-form-subtitle", children: "Enter your email address and we'll send you a link to reset your password." })
    ] }),
    /* @__PURE__ */ e(ee, { error: d, onDismiss: u }),
    /* @__PURE__ */ i("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: p, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: p,
          type: "email",
          className: "cedros-input",
          value: a,
          onChange: (h) => s(h.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: c
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: c || !a,
          children: c ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(K, { size: "sm" }),
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
          disabled: c,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const $o = {
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
function Jo() {
  const { config: t, _internal: r } = ne(), [o, a] = k(!1), [s, n] = k(!1), [c, l] = k(null), d = $(t), u = O(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  );
  F(() => {
    d.current = t;
  }, [t]), F(() => {
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
          }), h && n(!0);
        } catch {
          h && l({
            code: "SERVER_ERROR",
            message: "Failed to initialize Apple Sign In"
          });
        }
    };
    return $o.load().then(() => {
      h && w();
    }).catch(() => {
      h && l({
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
      throw l(h), h;
    }
    if (!s) {
      const h = {
        code: "VALIDATION_ERROR",
        message: "Apple Sign In not initialized"
      };
      throw l(h), h;
    }
    a(!0), l(null);
    try {
      const h = await window.AppleID.auth.signIn(), w = h.authorization?.id_token;
      if (!w)
        throw new Error("No ID token received from Apple");
      const g = h.user?.name ? `${h.user.name.firstName || ""} ${h.user.name.lastName || ""}`.trim() : void 0, m = await u.post("/apple", {
        idToken: w,
        name: g || void 0
      });
      return d.current.callbacks?.onLoginSuccess?.(m.user, "apple"), r?.handleLoginSuccess(m.user, m.tokens), a(!1), m;
    } catch (h) {
      if (h.error === "popup_closed_by_user") {
        const m = {
          code: "SERVER_ERROR",
          message: "Apple Sign In was cancelled"
        };
        throw l(m), a(!1), m;
      }
      const g = q(h, "Apple sign-in failed");
      throw l(g), a(!1), g;
    }
  }, [t.appleClientId, s, u, r]), f = C(() => l(null), []);
  return {
    signIn: p,
    isLoading: o,
    isInitialized: s,
    error: c,
    clearError: f
  };
}
function os() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const t = navigator.userAgent.toLowerCase(), r = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(t) || r.includes("mac") || /macintosh/.test(t) || r === "macintel" && navigator.maxTouchPoints > 1);
}
function Xo({
  onSuccess: t,
  onError: r,
  className: o = "",
  variant: a = "default",
  size: s = "md",
  disabled: n = !1,
  hideOnNonApple: c = !0
}) {
  const { signIn: l, isLoading: d, isInitialized: u } = Jo(), [p] = k(() => os());
  if (c && !p)
    return null;
  const f = async () => {
    try {
      await l(), t?.();
    } catch (g) {
      const m = g instanceof Error ? g : new Error(String(g));
      r?.(m);
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
      }[a]} ${h[s]} ${o}`,
      onClick: f,
      disabled: n || !u || d,
      "aria-label": "Sign in with Apple",
      children: [
        d ? /* @__PURE__ */ e(K, { size: "sm" }) : /* @__PURE__ */ e(
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
function se(t, r) {
  if (!t) throw new Error(r);
}
function Zo(t) {
  return t.replace(/-/g, "+").replace(/_/g, "/");
}
function $e(t) {
  se(typeof t == "string" && t.length > 0, "Expected base64url string");
  const r = Zo(t), o = r + "=".repeat((4 - r.length % 4) % 4), a = atob(o), s = new Uint8Array(a.length);
  for (let n = 0; n < a.length; n++) s[n] = a.charCodeAt(n);
  return s.buffer;
}
function Ce(t) {
  const r = new Uint8Array(t);
  let o = "";
  for (let s = 0; s < r.length; s++) o += String.fromCharCode(r[s]);
  return btoa(o).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ns(t) {
  se(typeof t == "object" && t !== null, "Invalid credential descriptor");
  const r = t;
  return se(typeof r.type == "string", "Invalid credential descriptor type"), se(typeof r.id == "string", "Invalid credential descriptor id"), {
    type: r.type,
    id: $e(r.id),
    transports: Array.isArray(r.transports) ? r.transports : void 0
  };
}
function en(t) {
  se(t && typeof t == "object", "Missing creation options");
  const r = t.publicKey;
  se(r && typeof r == "object", "Missing creation options.publicKey"), se(typeof r.challenge == "string", "Missing creation challenge"), se(typeof r.rp == "object" && r.rp !== null, "Missing rp"), se(typeof r.user == "object" && r.user !== null, "Missing user");
  const o = r.rp, a = r.user;
  se(typeof o.name == "string", "Missing rp.name"), se(typeof a.id == "string", "Missing user.id"), se(typeof a.name == "string", "Missing user.name"), se(typeof a.displayName == "string", "Missing user.displayName");
  const s = Array.isArray(r.excludeCredentials) ? r.excludeCredentials.map(ns) : void 0, n = Array.isArray(r.pubKeyCredParams) ? r.pubKeyCredParams.map((c) => ({
    type: c.type,
    alg: c.alg
  })) : [];
  return {
    challenge: $e(r.challenge),
    rp: {
      name: o.name,
      id: typeof o.id == "string" ? o.id : void 0
    },
    user: {
      id: $e(a.id),
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
}
function tn(t) {
  se(t && typeof t == "object", "Missing request options");
  const r = t.publicKey;
  se(r && typeof r == "object", "Missing request options.publicKey"), se(typeof r.challenge == "string", "Missing request challenge");
  const o = Array.isArray(r.allowCredentials) ? r.allowCredentials.map(ns) : void 0;
  return {
    challenge: $e(r.challenge),
    rpId: typeof r.rpId == "string" ? r.rpId : void 0,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    userVerification: typeof r.userVerification == "string" ? r.userVerification : void 0,
    allowCredentials: o,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
}
function Xt(t) {
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
function rn() {
  if (typeof window < "u") {
    const t = window.location?.hostname, r = t === "localhost" || t === "127.0.0.1" || t?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !r)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Zt(t) {
  if (!(t instanceof Error)) return null;
  const r = t.name;
  return r === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : r === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : r === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function sn() {
  const { config: t, _internal: r } = ne(), [o, a] = k(!1), [s, n] = k(null), c = O(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: r?.getAccessToken
    }),
    [r?.getAccessToken, t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), l = C(() => n(null), []), d = rn(), u = C(
    async (f) => {
      if (!d) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(h), h;
      }
      a(!0), n(null);
      try {
        const h = await c.post(
          "/webauthn/auth/options",
          { email: f?.email }
        ), w = tn(h.options), g = await navigator.credentials.get({
          publicKey: w
        });
        if (!g)
          throw new Error("Passkey authentication returned no credential");
        const m = await c.post("/webauthn/auth/verify", {
          challengeId: h.challengeId,
          credential: Xt(g)
        });
        return t.callbacks?.onLoginSuccess?.(m.user, "webauthn"), r?.handleLoginSuccess(m.user, m.tokens), m;
      } catch (h) {
        const g = Zt(h) ?? q(h, "Passkey sign-in failed");
        throw n(g), g;
      } finally {
        a(!1);
      }
    },
    [c, t.callbacks, r, d]
  ), p = C(
    async (f) => {
      if (!d) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(h), h;
      }
      a(!0), n(null);
      try {
        const h = await c.post(
          "/webauthn/register/options",
          {}
        ), w = en(h.options), g = await navigator.credentials.create({
          publicKey: w
        });
        if (!g)
          throw new Error("Passkey registration returned no credential");
        const m = await c.post("/webauthn/register/verify", {
          challengeId: h.challengeId,
          credential: Xt(g),
          label: f?.label
        });
        if (!m.success)
          throw new Error("Passkey registration failed");
        return { credentialId: m.credentialId, label: m.label };
      } catch (h) {
        const g = Zt(h) ?? q(h, "Passkey registration failed");
        throw n(g), g;
      } finally {
        a(!1);
      }
    },
    [c, d]
  );
  return {
    isSupported: d,
    isLoading: o,
    error: s,
    clearError: l,
    authenticatePasskey: u,
    registerPasskey: p
  };
}
function on({
  onSuccess: t,
  className: r = "",
  children: o,
  disabled: a
}) {
  const { authenticatePasskey: s, isLoading: n, isSupported: c } = sn(), l = a || !c || n;
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${r}`,
      onClick: async () => {
        await s(), t?.();
      },
      disabled: l,
      "aria-disabled": l,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ e(nn, {}) }),
        /* @__PURE__ */ e("span", { children: o ?? (n ? "Continuing..." : "Continue with Passkey") })
      ]
    }
  );
}
function nn() {
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
const Le = ["login", "register"];
function Ot({ onSuccess: t, className: r = "", defaultTab: o = "login" }) {
  const { config: a } = ne(), [s, n] = k(o), [c, l] = k("form"), [d, u] = k(() => Jt()), [p] = k(() => os());
  F(() => {
    const E = () => u(Jt());
    return E(), window.addEventListener("load", E), window.addEventListener("focus", E), () => {
      window.removeEventListener("load", E), window.removeEventListener("focus", E);
    };
  }, []);
  const f = a.forms?.forgotPassword?.mode ?? "reset", h = C(
    (E) => {
      const T = Le.indexOf(s);
      let A = T;
      switch (E.key) {
        case "ArrowLeft":
        case "ArrowUp":
          A = T === 0 ? Le.length - 1 : T - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          A = T === Le.length - 1 ? 0 : T + 1;
          break;
        case "Home":
          A = 0;
          break;
        case "End":
          A = Le.length - 1;
          break;
        default:
          return;
      }
      E.preventDefault();
      const S = Le[A];
      n(S), document.getElementById(`cedros-tab-${S}`)?.focus();
    },
    [s]
  ), w = a.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, g = w.email !== !1, m = w.google !== !1 && a.googleClientId, b = w.apple !== !1 && a.appleClientId && p, v = w.solana !== !1 && d, y = w.webauthn !== !1, N = g && (m || b || v || y);
  return c === "forgotPassword" ? /* @__PURE__ */ e("div", { className: `cedros-login-form ${r}`, children: /* @__PURE__ */ e(Go, { onCancel: () => l("form") }) }) : /* @__PURE__ */ i("div", { className: `cedros-login-form ${r}`, children: [
    (y || m || b || v) && /* @__PURE__ */ i("div", { className: "cedros-social-buttons", children: [
      y && /* @__PURE__ */ e(on, { onSuccess: t }),
      m && /* @__PURE__ */ e(Ks, { onSuccess: t }),
      b && /* @__PURE__ */ e(Xo, { onSuccess: t }),
      v && /* @__PURE__ */ e(Gs, { onSuccess: t })
    ] }),
    N && /* @__PURE__ */ e("div", { className: "cedros-divider", children: /* @__PURE__ */ e("span", { children: "Or continue with" }) }),
    g && /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${s === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => n("login"),
            onKeyDown: h,
            "aria-selected": s === "login",
            "aria-controls": "cedros-tabpanel-login",
            tabIndex: s === "login" ? 0 : -1,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-register",
            className: `cedros-tab ${s === "register" ? "cedros-tab-active" : ""}`,
            onClick: () => n("register"),
            onKeyDown: h,
            "aria-selected": s === "register",
            "aria-controls": "cedros-tabpanel-register",
            tabIndex: s === "register" ? 0 : -1,
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "div",
        {
          role: "tabpanel",
          id: `cedros-tabpanel-${s}`,
          "aria-labelledby": `cedros-tab-${s}`,
          children: s === "login" ? /* @__PURE__ */ e(
            Hs,
            {
              onSuccess: t,
              onSwitchToRegister: () => n("register"),
              onForgotPassword: f === "reset" ? () => l("forgotPassword") : void 0
            }
          ) : /* @__PURE__ */ e(
            Qs,
            {
              onSuccess: t,
              onSwitchToLogin: () => n("login")
            }
          )
        }
      )
    ] })
  ] });
}
class an extends qs {
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
    const { hasError: r, error: o, errorInfo: a } = this.state, { children: s, fallback: n, showDetails: c = !1 } = this.props;
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
      c && o && /* @__PURE__ */ i("details", { className: "cedros-error-boundary-details", children: [
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
function hl({ className: t = "", title: r = "Sign in to your account" }) {
  const { isModalOpen: o, closeModal: a } = ne(), s = $(null), n = $(null), c = $(a);
  if (F(() => {
    c.current = a;
  }, [a]), F(() => {
    if (!o) return;
    n.current = document.activeElement, s.current?.focus();
    const d = (p) => {
      if (p.key === "Escape" && c.current(), p.key === "Tab" && s.current) {
        const f = s.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), h = f[0], w = f[f.length - 1];
        p.shiftKey && document.activeElement === h ? (p.preventDefault(), w?.focus()) : !p.shiftKey && document.activeElement === w && (p.preventDefault(), h?.focus());
      }
    };
    document.addEventListener("keydown", d);
    const u = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", d), document.body.style.overflow = u, n.current instanceof HTMLElement && n.current.focus();
    };
  }, [o]), !o) return null;
  const l = (d) => {
    d.target === d.currentTarget && a();
  };
  return /* @__PURE__ */ e(
    "div",
    {
      className: `cedros-modal-backdrop ${t}`,
      onClick: l,
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
            /* @__PURE__ */ e("div", { className: "cedros-modal-content", children: /* @__PURE__ */ e(an, { children: /* @__PURE__ */ e(Ot, { onSuccess: a }) }) })
          ]
        }
      )
    }
  );
}
function pl({
  token: t,
  onSuccess: r,
  onLoginClick: o,
  className: a = ""
}) {
  const [s, n] = k(""), [c, l] = k(""), [d, u] = k(null), { resetPassword: p, isLoading: f, isSuccess: h, error: w, clearError: g } = ss(), m = s === c, b = d?.isValid && m && s.length > 0, v = async (y) => {
    if (y.preventDefault(), !!b)
      try {
        await p(t, s), r?.();
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
    o && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: o,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ i("form", { className: `cedros-reset-password-form ${a}`, onSubmit: v, children: [
    /* @__PURE__ */ i("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ e("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ e(ee, { error: w, onDismiss: g }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      we,
      {
        label: "New password",
        value: s,
        onChange: (y) => {
          n(y.target.value), u(Ut(y.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: u,
        disabled: f,
        autoComplete: "new-password",
        error: d && !d.isValid ? Object.values(d.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      we,
      {
        label: "Confirm password",
        value: c,
        onChange: (y) => l(y.target.value),
        disabled: f,
        autoComplete: "new-password",
        error: c && !m ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: f || !b,
          children: f ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(K, { size: "sm" }),
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
function Rt({ org: t, size: r = "lg", className: o = "" }) {
  const a = zr(t.logoUrl), s = r === "lg" ? "cedros-org-avatar-lg" : "", n = ["cedros-org-avatar", s, o].filter(Boolean).join(" "), c = ["cedros-org-avatar-placeholder", s, o].filter(Boolean).join(" ");
  return a ? /* @__PURE__ */ e(
    "img",
    {
      src: a,
      alt: t.name,
      className: n,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ e("div", { className: c, children: t.name[0]?.toUpperCase() || "?" });
}
function ml({
  orgs: t,
  activeOrg: r,
  isLoading: o = !1,
  onSelect: a,
  onCreateClick: s,
  className: n = "",
  placeholder: c = "Select organization"
}) {
  const [l, d] = k(!1), u = $(null);
  F(() => {
    const w = (g) => {
      u.current && !u.current.contains(g.target) && d(!1);
    };
    return document.addEventListener("mousedown", w), () => document.removeEventListener("mousedown", w);
  }, []), F(() => {
    const w = (g) => {
      g.key === "Escape" && d(!1);
    };
    if (l)
      return document.addEventListener("keydown", w), () => document.removeEventListener("keydown", w);
  }, [l]);
  const p = C(
    (w) => {
      a(w), d(!1);
    },
    [a]
  ), f = C(() => {
    d(!1), s?.();
  }, [s]), h = C(() => {
    d((w) => !w);
  }, []);
  return o ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${n}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ e(K, { size: "sm" }),
        /* @__PURE__ */ e("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { ref: u, className: `cedros-org-selector ${n}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: h,
        "aria-haspopup": "listbox",
        "aria-expanded": l,
        children: [
          r ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(Rt, { org: r, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-name", children: r.name }),
            /* @__PURE__ */ e(er, { role: r.membership.role })
          ] }) : /* @__PURE__ */ e("span", { className: "cedros-org-selector-placeholder", children: c }),
          /* @__PURE__ */ e(ln, { isOpen: l })
        ]
      }
    ),
    l && /* @__PURE__ */ i("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ e("ul", { className: "cedros-org-selector-list", children: t.map((w) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${w.id === r?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => p(w.id),
          role: "option",
          "aria-selected": w.id === r?.id,
          children: [
            /* @__PURE__ */ e(Rt, { org: w, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-item-name", children: w.name }),
            /* @__PURE__ */ e(er, { role: w.membership.role }),
            w.id === r?.id && /* @__PURE__ */ e(cn, {})
          ]
        }
      ) }, w.id)) }),
      s && /* @__PURE__ */ i(X, { children: [
        /* @__PURE__ */ e("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: f,
            children: [
              /* @__PURE__ */ e(dn, {}),
              /* @__PURE__ */ e("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function er({ role: t }) {
  return /* @__PURE__ */ e("span", { className: `cedros-org-role cedros-org-role-${t}`, children: t });
}
function ln({ isOpen: t }) {
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
function cn() {
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
function dn() {
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
function un() {
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
function hn() {
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
function pn() {
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
function mn({
  orgs: t,
  activeOrg: r,
  isLoading: o,
  onSelect: a,
  onCreateClick: s
}) {
  return o ? /* @__PURE__ */ i("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ i(X, { children: [
    t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ e("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ e("ul", { className: "cedros-org-switcher-list", children: t.map((n) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${n.id === r?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => a(n.id),
        children: [
          /* @__PURE__ */ e(Rt, { org: n }),
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
          n.id === r?.id && /* @__PURE__ */ e(hn, {})
        ]
      }
    ) }, n.id)) }),
    s && /* @__PURE__ */ i("button", { type: "button", className: "cedros-org-switcher-create", onClick: s, children: [
      /* @__PURE__ */ e(pn, {}),
      /* @__PURE__ */ e("span", { children: "Create new organization" })
    ] })
  ] });
}
function fn({ isLoading: t, onSubmit: r, onCancel: o }) {
  const [a, s] = k(""), [n, c] = k(""), [l, d] = k(null), u = C((f) => {
    s(f);
    const h = f.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    c(h);
  }, []), p = C(
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
      } catch (h) {
        d(h.message || "Failed to create organization");
      }
    },
    [a, n, r]
  );
  return /* @__PURE__ */ i("form", { className: "cedros-org-create-form", onSubmit: p, children: [
    l && /* @__PURE__ */ e(ee, { error: l }),
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
            onChange: (f) => c(f.target.value.toLowerCase()),
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
          children: t ? /* @__PURE__ */ e(K, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function fl({
  isOpen: t,
  onClose: r,
  orgs: o,
  activeOrg: a,
  isLoading: s = !1,
  error: n,
  onSelect: c,
  onCreate: l,
  className: d = ""
}) {
  return t ? /* @__PURE__ */ e(
    gn,
    {
      onClose: r,
      orgs: o,
      activeOrg: a,
      isLoading: s,
      error: n,
      onSelect: c,
      onCreate: l,
      className: d
    }
  ) : null;
}
function gn({
  onClose: t,
  orgs: r,
  activeOrg: o,
  isLoading: a = !1,
  error: s,
  onSelect: n,
  onCreate: c,
  className: l
}) {
  const [d, u] = k("list"), p = $(null), f = $(null);
  F(() => (f.current = document.activeElement, p.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    f.current?.focus();
  }), []), F(() => {
    const m = (b) => {
      if (b.key === "Escape") {
        t();
        return;
      }
      if (b.key === "Tab" && p.current) {
        const v = p.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), y = v[0], N = v[v.length - 1];
        b.shiftKey ? document.activeElement === y && (b.preventDefault(), N?.focus()) : document.activeElement === N && (b.preventDefault(), y?.focus());
      }
    };
    return document.addEventListener("keydown", m), () => document.removeEventListener("keydown", m);
  }, [t]);
  const h = C(
    (m) => {
      m.target === m.currentTarget && t();
    },
    [t]
  ), w = C(
    (m) => {
      n(m), t();
    },
    [n, t]
  ), g = C(
    async (m) => {
      await c?.(m), t();
    },
    [c, t]
  );
  return /* @__PURE__ */ e("div", { className: "cedros-modal-backdrop", onClick: h, children: /* @__PURE__ */ i(
    "div",
    {
      ref: p,
      className: `cedros-modal cedros-org-switcher ${l}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ e("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: d === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-modal-close", onClick: t, "aria-label": "Close", children: /* @__PURE__ */ e(un, {}) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-modal-body", children: [
          s && /* @__PURE__ */ e(ee, { error: s }),
          d === "list" ? /* @__PURE__ */ e(
            mn,
            {
              orgs: r,
              activeOrg: o,
              isLoading: a,
              onSelect: w,
              onCreateClick: c ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ e(
            fn,
            {
              isLoading: a,
              onSubmit: g,
              onCancel: () => u("list")
            }
          )
        ] })
      ]
    }
  ) });
}
function gl({
  sessions: t,
  isLoading: r = !1,
  error: o,
  onRevokeAll: a,
  className: s = ""
}) {
  const [n, c] = k(!1), [l, d] = k(!1), u = $(null), p = O(() => t.filter((h) => !h.isCurrent).length, [t]), f = C(async () => {
    if (!a) return;
    const h = t.filter((g) => !g.isCurrent).length;
    if (!(h === 0 || !window.confirm(
      `Are you sure you want to sign out of ${h} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      c(!0), d(!1);
      try {
        await a(), d(!0), u.current !== null && window.clearTimeout(u.current), u.current = window.setTimeout(() => {
          d(!1), u.current = null;
        }, 3e3);
      } finally {
        c(!1);
      }
    }
  }, [a, t]);
  return F(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), r && t.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-session-list cedros-session-list-loading ${s}`, children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { children: "Loading sessions..." })
  ] }) : o ? /* @__PURE__ */ e("div", { className: `cedros-session-list ${s}`, children: /* @__PURE__ */ e(ee, { error: o }) }) : t.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-session-list cedros-session-list-empty ${s}`, children: /* @__PURE__ */ e("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-session-list ${s}`, children: [
    l && /* @__PURE__ */ i("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ e(kn, {}),
      /* @__PURE__ */ e("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ e("ul", { className: "cedros-session-items", children: t.map((h) => /* @__PURE__ */ e(wn, { session: h }, h.id)) }),
    a && p > 0 && /* @__PURE__ */ e("div", { className: "cedros-session-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: f,
        disabled: n,
        children: n ? /* @__PURE__ */ i(X, { children: [
          /* @__PURE__ */ e(K, { size: "sm" }),
          /* @__PURE__ */ e("span", { children: "Signing out..." })
        ] }) : `Sign out of ${p} other device${p > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function wn({ session: t }) {
  const r = yn(t.userAgent), o = An(t.expiresAt);
  return /* @__PURE__ */ i("li", { className: `cedros-session-item ${t.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ e(vn, { userAgent: t.userAgent }) }),
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
          bn(t.createdAt)
        ] }),
        o && /* @__PURE__ */ e("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function yn(t) {
  if (!t)
    return { browser: "Unknown browser", os: "Unknown device" };
  let r = "Unknown browser";
  t.includes("Chrome") && !t.includes("Edg") ? r = "Chrome" : t.includes("Safari") && !t.includes("Chrome") ? r = "Safari" : t.includes("Firefox") ? r = "Firefox" : t.includes("Edg") && (r = "Edge");
  let o = "Unknown device";
  return t.includes("Windows") ? o = "Windows" : t.includes("Mac") ? o = "macOS" : t.includes("Linux") ? o = "Linux" : t.includes("iPhone") || t.includes("iPad") ? o = "iOS" : t.includes("Android") && (o = "Android"), { browser: r, os: o };
}
function bn(t) {
  const r = new Date(t), a = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60)), n = Math.floor(a / (1e3 * 60 * 60)), c = Math.floor(a / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s} minute${s > 1 ? "s" : ""} ago` : n < 24 ? `${n} hour${n > 1 ? "s" : ""} ago` : c < 7 ? `${c} day${c > 1 ? "s" : ""} ago` : r.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function An(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = 3600 * 1e3;
  return r.getTime() - o.getTime() < a;
}
function vn({ userAgent: t }) {
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
function kn() {
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
function Nn({
  words: t,
  onConfirm: r,
  className: o = ""
}) {
  const [a, s] = k(!1), [n, c] = k(!1), l = $(null), d = Yo(t), u = C(async () => {
    try {
      await navigator.clipboard.writeText(t.join(" ")), s(!0), l.current !== null && window.clearTimeout(l.current), l.current = window.setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [t]);
  F(() => () => {
    l.current !== null && (window.clearTimeout(l.current), l.current = null);
  }, []);
  const p = C(() => {
    n && r();
  }, [n, r]);
  return /* @__PURE__ */ i("div", { className: `cedros-recovery-phrase-display ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ e("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-recovery-grid", children: d.map((f, h) => /* @__PURE__ */ e("div", { className: "cedros-word-group", children: f.map((w, g) => {
      const m = h * 4 + g + 1;
      return /* @__PURE__ */ i("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ i("span", { className: "cedros-word-number", children: [
          m,
          "."
        ] }),
        /* @__PURE__ */ e("span", { className: "cedros-word-text", children: w })
      ] }, m);
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
            checked: n,
            onChange: (f) => c(f.target.checked),
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
          disabled: !n,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function Cn({
  onSubmit: t,
  onCancel: r,
  isSubmitting: o = !1,
  error: a,
  className: s = ""
}) {
  const [n, c] = k(Array(le).fill("")), [l, d] = k(null), [u, p] = k([]), [f, h] = k(null), w = qr(), g = $(null), m = C(
    (A, S) => {
      const P = [...n];
      if (P[A] = S.toLowerCase().trim(), c(P), S.length > 0) {
        const x = Qo(S, 5);
        p(x);
      } else
        p([]);
      h(null);
    },
    [n]
  ), b = C((A) => {
    d(A), p([]);
  }, []), v = C(
    (A) => {
      const S = n[A];
      S && !We(S) && h(`Word ${A + 1} is not in the wordlist`), g.current !== null && window.clearTimeout(g.current), g.current = window.setTimeout(() => {
        l === A && p([]);
      }, 200);
    },
    [n, l]
  );
  F(() => () => {
    g.current !== null && (window.clearTimeout(g.current), g.current = null);
  }, []);
  const y = C(
    (A) => {
      if (l !== null) {
        const S = [...n];
        S[l] = A, c(S), p([]), document.querySelector(
          `[data-word-index="${l + 1}"]`
        )?.focus();
      }
    },
    [l, n]
  ), N = C((A) => {
    const S = A.clipboardData.getData("text"), P = Ko(S);
    P.length === le && (A.preventDefault(), c(P), h(null));
  }, []), E = C(
    (A) => {
      if (A.preventDefault(), n.filter((x) => !x).length > 0) {
        h(`Please enter all ${le} words`);
        return;
      }
      const P = n.map((x, M) => ({ word: x, index: M + 1 })).filter(({ word: x }) => !We(x));
      if (P.length > 0) {
        h(`Invalid words: ${P.map((x) => `#${x.index}`).join(", ")}`);
        return;
      }
      if (!rs(n)) {
        h("Invalid recovery phrase - please check your words");
        return;
      }
      t(n);
    },
    [n, t]
  ), T = a || f;
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
              className: `cedros-word-input ${n[S] && !We(n[S]) ? "cedros-word-invalid" : n[S] && We(n[S]) ? "cedros-word-valid" : ""}`,
              value: n[S],
              onChange: (P) => m(S, P.target.value),
              onFocus: () => b(S),
              onBlur: () => v(S),
              "data-word-index": S,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: o,
              "aria-label": `Word ${S + 1}`
            }
          )
        ] }, S)) }),
        l !== null && u.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-suggestions", role: "listbox", id: `${w}-suggestions`, children: u.map((A) => /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => y(A),
            role: "option",
            children: A
          },
          A
        )) }),
        T && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: T }),
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
function wl({ capabilities: t, className: r = "" }) {
  if (t.allSupported)
    return null;
  const o = Is(t), a = Us();
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
const En = ["share_c_only", "full_seed", "none"];
function Sn(t) {
  return t && En.includes(t) ? t : "share_c_only";
}
const xn = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function as() {
  const t = ve(), [r, o] = k(null), [a, s] = k(!!t), [n, c] = k(null), l = O(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts
  }) : null, [t]), d = C(async () => {
    if (l) {
      s(!0), c(null);
      try {
        const u = await l.get("/discovery");
        u.wallet ? o({
          enabled: u.wallet.enabled,
          recoveryMode: Sn(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : o({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const p = u instanceof Error ? u.message : "Failed to fetch wallet config";
        c(p), o({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        s(!1);
      }
    }
  }, [l]);
  return F(() => {
    l && d();
  }, [l, d]), t ? {
    walletEnabled: r?.enabled ?? !1,
    recoveryMode: r?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: r?.unlockTtlSeconds ?? 900,
    isLoading: a,
    error: n,
    refetch: d
  } : xn;
}
function Pn() {
  const { user: t } = ne(), { enroll: r } = Me(), { recoveryMode: o } = as(), [a, s] = k({ step: "idle" }), [n, c] = k(!1), l = $([]), d = C(() => {
    Rr(...l.current), l.current = [];
  }, []);
  F(() => () => {
    d();
  }, [d]);
  const u = C(
    async (g, m, b, v) => {
      s({ step: "generating_seed" });
      const y = Fs();
      l.current.push(y), s({ step: "splitting_shares" });
      const { shareA: N, shareB: E, shareC: T } = Qr(y);
      l.current.push(N, E, T), s({ step: "encrypting_shares" });
      const A = await Dr(N, Ir(m)), S = Yr(y), P = Kr(S);
      s({ step: "uploading" });
      const x = {
        solanaPubkey: P,
        shareAAuthMethod: g,
        shareACiphertext: A.ciphertext,
        shareANonce: A.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: ge(E)
      };
      if (g === "password") {
        if (!b) throw new Error("KDF salt required for password method");
        x.shareAKdfSalt = ge(b), x.shareAKdfParams = Ve;
      }
      if (g === "passkey" && v && (x.prfSalt = v), await r(x), o === "none")
        d(), s({
          step: "complete",
          solanaPubkey: P
        });
      else {
        const M = o === "full_seed" ? Vo(y) : jo(ze(T));
        s({
          step: "showing_recovery",
          recoveryPhrase: M,
          solanaPubkey: P
        });
      }
    },
    [r, o, d]
  ), p = C(
    async (g) => {
      if (!t) {
        s({ step: "error", error: "User not authenticated" });
        return;
      }
      c(!0), d();
      try {
        const m = Ur(), b = await Gr(g, m, Ve);
        l.current.push(b), await u("password", b, m);
      } catch (m) {
        s({
          step: "error",
          error: m instanceof Error ? m.message : "Enrollment failed"
        });
      } finally {
        c(!1);
      }
    },
    [t, d, u]
  ), f = C(async () => {
    if (!t) {
      s({ step: "error", error: "User not authenticated" });
      return;
    }
    c(!0), d();
    try {
      const g = Fr(), m = ge(g);
      s({ step: "registering_passkey" });
      let b;
      try {
        const y = new TextEncoder().encode(t.id), N = t.name ?? t.email ?? "User", E = t.email ?? t.id;
        b = (await Ws(
          y,
          E,
          N,
          g
        )).prfOutput;
      } catch (y) {
        if (y?.name !== "InvalidStateError")
          throw y;
        b = (await It(m)).prfOutput;
      }
      l.current.push(b);
      const v = await Wr(b, g);
      l.current.push(v), await u("passkey", v, void 0, m);
    } catch (g) {
      s({
        step: "error",
        error: g instanceof Error ? g.message : "Enrollment failed"
      });
    } finally {
      c(!1);
    }
  }, [t, d, u]), h = C(() => {
    const g = a.solanaPubkey;
    d(), s({
      step: "complete",
      solanaPubkey: g
    });
  }, [a.solanaPubkey, d]), w = C(() => {
    d(), s({ step: "idle" }), c(!1);
  }, [d]);
  return {
    state: a,
    startEnrollmentWithPassword: p,
    startEnrollmentWithPasskey: f,
    confirmRecoveryPhrase: h,
    cancel: w,
    isEnrolling: n
  };
}
function Tn({
  onComplete: t,
  onCancel: r,
  className: o = "",
  forceAuthMethod: a
}) {
  const { user: s } = ne(), {
    state: n,
    startEnrollmentWithPassword: c,
    startEnrollmentWithPasskey: l,
    confirmRecoveryPhrase: d,
    cancel: u,
    isEnrolling: p
  } = Pn(), f = () => a || "password", [h, w] = k(f), [g, m] = k(""), [b, v] = k(""), [y, N] = k(null);
  F(() => {
    w(f());
  }, [s?.id, a]);
  const E = C(
    async (P) => {
      if (P.preventDefault(), g !== b) {
        N("Passwords do not match");
        return;
      }
      const x = Ut(g);
      if (!x.isValid) {
        const M = Object.values(x.errors)[0];
        N(M ?? "Password does not meet requirements");
        return;
      }
      N(null), await c(g);
    },
    [g, b, c]
  ), T = C(async () => {
    await l();
  }, [l]), A = C(() => {
    d(), n.solanaPubkey && t?.(n.solanaPubkey);
  }, [d, n.solanaPubkey, t]), S = C(() => {
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
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ e(Nn, { words: n.recoveryPhrase, onConfirm: A }) }) : n.step === "complete" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-complete", children: [
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
    h === "password" && /* @__PURE__ */ i("form", { onSubmit: E, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ e(
        we,
        {
          label: "Password",
          value: g,
          onChange: (P) => m(P.target.value),
          showStrengthMeter: !0,
          disabled: p,
          required: !0,
          minLength: 8,
          placeholder: "Enter a strong password"
        }
      ),
      /* @__PURE__ */ e(
        we,
        {
          label: "Confirm Password",
          value: b,
          onChange: (P) => v(P.target.value),
          error: y ?? void 0,
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
            onClick: S,
            disabled: p,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: p || !g || !b,
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
            onClick: S,
            disabled: p,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: T,
            disabled: p,
            children: p ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] })
  ] });
}
function Ln() {
  const { user: t } = ne(), { signTransaction: r } = Me(), [o, a] = k(!1), [s, n] = k(null), c = C(
    async (d, u) => {
      if (!t) {
        const p = "User not authenticated";
        throw n(p), new Error(p);
      }
      a(!0), n(null);
      try {
        const p = {
          transaction: ge(d),
          ...u ? { credential: Os(u) } : {}
        }, f = await r(p);
        return Or(f.signature);
      } catch (p) {
        const f = p instanceof Error ? p.message : "Signing failed";
        throw n(f), p;
      } finally {
        a(!1);
      }
    },
    [t, r]
  ), l = C(() => n(null), []);
  return {
    signTransaction: c,
    isSigning: o,
    error: s,
    clearError: l
  };
}
function _n() {
  const { getMaterial: t } = Me(), [r, o] = k(!1), [a, s] = k(null), n = C(async () => {
    o(!0), s(null);
    try {
      const l = await t();
      if (!l)
        throw new Error("No wallet enrolled");
      if (l.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!l.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const d = await It(l.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: ge(d.prfOutput)
        };
      } finally {
        d.prfOutput.fill(0);
      }
    } catch (l) {
      const d = l instanceof Error ? l.message : "Passkey authentication failed";
      return s(d), null;
    } finally {
      o(!1);
    }
  }, [t]), c = C(() => s(null), []);
  return {
    getPasskeyCredential: n,
    isAuthenticating: r,
    error: a,
    clearError: c
  };
}
function Mn({
  mode: t,
  isLoading: r = !1,
  error: o,
  onPrompt: a,
  onRetry: s,
  onCancel: n,
  title: c,
  description: l,
  className: d = ""
}) {
  const u = C(() => {
    r || a?.();
  }, [r, a]), p = C(() => {
    s?.();
  }, [s]), f = t === "register" ? "Set Up Passkey" : "Verify with Passkey", h = t === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ i("div", { className: `cedros-passkey-prompt ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-passkey-icon", children: r ? /* @__PURE__ */ e(Rn, {}) : o ? /* @__PURE__ */ e(Dn, {}) : /* @__PURE__ */ e(Bn, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-passkey-title", children: c ?? f }),
    /* @__PURE__ */ e("p", { className: "cedros-passkey-description", children: l ?? h }),
    o && /* @__PURE__ */ e("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ e("p", { children: o }) }),
    /* @__PURE__ */ e("div", { className: "cedros-passkey-actions", children: o ? /* @__PURE__ */ i(X, { children: [
      s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: p,
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
    ] }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: u,
          disabled: r,
          children: r ? /* @__PURE__ */ i(X, { children: [
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
function Bn() {
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
function Rn() {
  return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ e("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function Dn() {
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
function In({
  onUnlock: t,
  onCancel: r,
  showCancel: o = !0,
  authMethod: a,
  className: s = ""
}) {
  ne();
  const { unlock: n, getMaterial: c, isLoading: l } = Me(), { getPasskeyCredential: d, isAuthenticating: u } = _n(), [p, f] = k("idle"), [h, w] = k(a ?? null), [g, m] = k(""), [b, v] = k(null);
  F(() => {
    a !== void 0 && w(a);
  }, [a]);
  const y = h === "password", N = h === "passkey", E = C(async () => {
    if (f("credential"), v(null), !h)
      try {
        const _ = await c();
        _ ? w(_.shareAAuthMethod) : (v("No wallet enrolled"), f("error"));
      } catch (_) {
        v(_ instanceof Error ? _.message : "Failed to get wallet info"), f("error");
      }
  }, [h, c]), T = C(
    async (_) => {
      _.preventDefault(), v(null), f("unlocking");
      try {
        let L;
        if (y)
          L = { type: "password", password: g };
        else
          throw new Error("Invalid auth method");
        await n(L), f("unlocked"), t?.();
      } catch (L) {
        v(L instanceof Error ? L.message : "Failed to unlock wallet"), f("error");
      }
    },
    [y, g, n, t]
  ), A = C(async () => {
    v(null), f("unlocking");
    try {
      const _ = await d();
      if (!_) {
        f("credential");
        return;
      }
      await n(_), f("unlocked"), t?.();
    } catch (_) {
      v(_ instanceof Error ? _.message : "Failed to unlock wallet"), f("error");
    }
  }, [d, n, t]), S = C(() => {
    m(""), f("idle"), v(null), r?.();
  }, [r]), P = C(() => {
    m(""), f("credential"), v(null);
  }, []), x = l || u, M = () => {
    switch (p) {
      case "idle":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Un, {}) }),
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
        return y ? /* @__PURE__ */ i("form", { className: "cedros-wallet-unlock-form", onSubmit: T, children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ e(
            we,
            {
              label: "Password",
              value: g,
              onChange: (_) => m(_.target.value),
              disabled: x,
              autoComplete: "current-password",
              error: b ?? void 0
            }
          ),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary",
                disabled: x || g.length === 0,
                children: x ? "Unlocking..." : "Unlock"
              }
            ),
            o && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: S,
                disabled: x,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ e(
            Mn,
            {
              mode: "authenticate",
              isLoading: x,
              error: b ?? void 0,
              onPrompt: A,
              onRetry: A,
              onCancel: o ? S : void 0
            }
          )
        ] }) : /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ e(K, { size: "xl" }),
          /* @__PURE__ */ e("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(K, { size: "xl" }) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Fn, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Wn, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: b ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: P,
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
  return /* @__PURE__ */ e("div", { className: `cedros-wallet-unlock ${s}`, children: M() });
}
function Un() {
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
function Fn() {
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
function Wn() {
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
function On() {
  const { recover: t, getShareBForRecovery: r } = Me(), { recoveryMode: o } = as(), [a, s] = k({ step: "idle" }), [n, c] = k(!1), l = $([]), d = C(() => {
    Rr(...l.current), l.current = [];
  }, []);
  F(() => () => {
    d();
  }, [d]);
  const u = C(
    async (f, h, w) => {
      c(!0), d();
      try {
        if (s({ step: "validating" }), !rs(f))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let g;
        if (o === "share_c_only") {
          const P = zo(f);
          l.current.push(P);
          const x = ge(P), M = await r({ shareC: x }), _ = Or(M.shareB);
          l.current.push(_), g = xo(ze(_), ze(P)), l.current.push(g);
        } else
          g = Ho(f), l.current.push(g);
        const m = Yr(g), b = Kr(m), { shareA: v, shareB: y } = Qr(g);
        l.current.push(v, y), s({ step: "encrypting" });
        let N, E, T;
        if (h === "passkey") {
          const P = Fr();
          T = ge(P);
          const x = await It(T);
          l.current.push(x.prfOutput), N = await Wr(x.prfOutput, P), l.current.push(N);
        } else
          E = Ur(), N = await Gr(w, E, Ve), l.current.push(N);
        const A = await Dr(v, Ir(N));
        s({ step: "uploading" });
        const S = {
          solanaPubkey: b,
          shareAAuthMethod: h,
          shareACiphertext: A.ciphertext,
          shareANonce: A.nonce,
          shareB: ge(y)
        };
        h === "password" && (S.shareAKdfSalt = ge(E), S.shareAKdfParams = Ve), h === "passkey" && (S.prfSalt = T), await t(S), d(), s({ step: "complete" });
      } catch (g) {
        d(), s({
          step: "error",
          error: g instanceof Error ? g.message : "Recovery failed"
        });
      } finally {
        c(!1);
      }
    },
    [t, r, o, d]
  ), p = C(() => {
    d(), s({ step: "idle" }), c(!1);
  }, [d]);
  return {
    state: a,
    startRecovery: u,
    cancel: p,
    isRecovering: n
  };
}
function qn({
  onComplete: t,
  onCancel: r,
  className: o = "",
  defaultAuthMethod: a = "password"
}) {
  const { state: s, startRecovery: n, cancel: c, isRecovering: l } = On(), [d, u] = k([]), [p, f] = k(!1), [h, w] = k(a), [g, m] = k(""), [b, v] = k(""), [y, N] = k(null), E = C((x) => {
    u(x), f(!0);
  }, []), T = C(
    async (x) => {
      if (x.preventDefault(), N(null), h !== "passkey") {
        if (g !== b) {
          N("Passwords do not match");
          return;
        }
        if (h === "password" && g.length < 8) {
          N("Password must be at least 8 characters");
          return;
        }
      }
      await n(d, h, g);
    },
    [d, h, g, b, n]
  ), A = C(() => {
    c(), u([]), f(!1), m(""), v(""), r?.();
  }, [c, r]), S = C(() => {
    f(!1), m(""), v("");
  }, []), P = C(() => {
    t?.();
  }, [t]);
  return s.step === "validating" || s.step === "encrypting" || s.step === "uploading" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(jn, {}) }),
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
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(zn, {}) }),
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
        onClick: P,
        children: "Done"
      }
    ) })
  ] }) }) : s.step === "error" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(Vn, {}) }),
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
  ] }) }) : p ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("form", { className: "cedros-wallet-recovery-credential", onSubmit: T, children: [
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
            disabled: l
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
            disabled: l
          }
        ),
        /* @__PURE__ */ e("span", { children: "Passkey" })
      ] })
    ] }),
    h === "password" && /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ e("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: g,
            onChange: (x) => m(x.target.value),
            disabled: l,
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
            value: b,
            onChange: (x) => v(x.target.value),
            disabled: l,
            "aria-invalid": y ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        y && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: y })
      ] })
    ] }),
    h === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ e(Hn, {}),
      /* @__PURE__ */ e("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: S,
          disabled: l,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: l || h !== "passkey" && (g.length === 0 || b.length === 0),
          children: l ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ e(
      Cn,
      {
        onSubmit: E,
        onCancel: A,
        isSubmitting: !1
      }
    )
  ] }) });
}
function jn() {
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
function zn() {
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
function Vn() {
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
function Hn() {
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
function Qn({
  address: t,
  label: r = "Wallet Address",
  showCopy: o = !0,
  showExplorerLink: a = !0,
  allowReveal: s = !0,
  className: n = ""
}) {
  const c = ve(), [l, d] = k(!1), [u, p] = k(null), [f, h] = k(!1), w = $(null), g = c?.config.solana?.network ?? "mainnet-beta", m = O(() => {
    const N = `https://explorer.solana.com/address/${t}`;
    return g === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(g)}`;
  }, [t, g]), b = s && t.length > 18, v = O(() => !b || f ? t : `${t.slice(0, 8)}...${t.slice(-8)}`, [t, b, f]), y = C(async () => {
    try {
      p(null), await navigator.clipboard.writeText(t), d(!0), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        d(!1), w.current = null;
      }, 2e3);
    } catch (N) {
      d(!1), p(N instanceof Error ? N.message : "Copy failed");
    }
  }, [t]);
  return F(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []), /* @__PURE__ */ i("div", { className: `cedros-wallet-address-row ${n}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey-label", children: r }),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-actions", children: [
        b && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => h((N) => !N),
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
            href: m,
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
            onClick: y,
            "aria-label": "Copy wallet address",
            children: l ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("code", { className: "cedros-wallet-status-pubkey-value", title: t, children: v }),
    u && /* @__PURE__ */ e("p", { className: "cedros-input-hint", role: "status", children: u })
  ] });
}
function Yn({
  status: t,
  publicKey: r,
  onLock: o,
  onEnroll: a,
  onUnlock: s,
  onRecover: n,
  showActions: c = !0,
  compact: l = !1,
  className: d = ""
}) {
  const u = t !== void 0, p = Xe(), f = u ? t : p.status, h = u ? r ?? null : p.solanaPubkey, w = u ? null : p.error, g = u ? () => {
  } : p.refresh, m = u ? () => {
  } : p.clearError, b = Kn(f, w);
  return l ? /* @__PURE__ */ i("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${d}`, children: [
    /* @__PURE__ */ e(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${b.color}`,
        title: b.label
      }
    ),
    /* @__PURE__ */ e("span", { className: "cedros-wallet-status-label", children: b.label }),
    h && /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey", title: h, children: Gn(h) })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-status ${d}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ e(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${b.color}`,
          children: /* @__PURE__ */ e($n, { status: f })
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ e("h4", { className: "cedros-wallet-status-title", children: b.title }),
        /* @__PURE__ */ e("p", { className: "cedros-wallet-status-description", children: b.description })
      ] })
    ] }),
    h && /* @__PURE__ */ e("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ e(Qn, { address: h }) }),
    w && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ e("p", { children: w }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: m,
          children: "Dismiss"
        }
      )
    ] }),
    c && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-actions", children: [
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
          onClick: g,
          children: "Retry"
        }
      )
    ] })
  ] });
}
function Kn(t, r) {
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
function Gn(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function $n({ status: t }) {
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
function yl({ className: t = "", showActions: r = !0 }) {
  const o = Xe(), [a, s] = k("status"), n = O(() => {
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
  }, [a]), c = C(() => s("status"), []), l = C(async () => {
    s("status"), await o.refresh();
  }, [o]), d = C(async () => {
    s("status"), await o.refresh();
  }, [o]), u = C(async () => {
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
          onClick: c,
          children: "Back"
        }
      )
    ] }),
    a === "status" && /* @__PURE__ */ e(
      Yn,
      {
        onEnroll: () => s("enroll"),
        onUnlock: () => s("unlock"),
        onRecover: () => s("recover_intro"),
        showActions: r
      }
    ),
    a === "enroll" && /* @__PURE__ */ e(
      Tn,
      {
        onComplete: () => {
          l();
        },
        onCancel: c
      }
    ),
    a === "unlock" && /* @__PURE__ */ e(
      In,
      {
        onUnlock: () => {
          d();
        },
        onCancel: c
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
            onClick: c,
            children: "Cancel"
          }
        )
      ] })
    ] }) }),
    a === "recover" && /* @__PURE__ */ e(
      qn,
      {
        onComplete: () => {
          u();
        },
        onCancel: c
      }
    )
  ] });
}
function Jn(t) {
  const r = Math.floor(t / 86400), o = Math.floor(t % 86400 / 3600), a = Math.floor(t % 3600 / 60), s = t % 60;
  return { days: r, hours: o, minutes: a, seconds: s };
}
function Xn(t) {
  const { days: r, hours: o, minutes: a } = Jn(t), s = [];
  return r > 0 && s.push(`${r}d`), o > 0 && s.push(`${o}h`), a > 0 && s.push(`${a}m`), s.length === 0 && s.push(`${t}s`), s.join(" ");
}
const Zn = {
  // ============= Authentication Providers =============
  // Email auth
  auth_email_enabled: {
    key: "auth_email_enabled",
    label: "Enable Email Authentication",
    description: "Allow users to sign up and log in with email/password.",
    inputType: "boolean"
  },
  auth_email_require_verification: {
    key: "auth_email_require_verification",
    label: "Require Email Verification",
    description: "Users must verify their email address before they can log in.",
    inputType: "boolean"
  },
  auth_email_block_disposable: {
    key: "auth_email_block_disposable",
    label: "Block Disposable Emails",
    description: "Reject registrations from known disposable email providers.",
    inputType: "boolean"
  },
  // Google OAuth
  auth_google_enabled: {
    key: "auth_google_enabled",
    label: "Enable Google Sign-In",
    description: "Allow users to authenticate with their Google account.",
    inputType: "boolean"
  },
  auth_google_client_id: {
    key: "auth_google_client_id",
    label: "Google Client ID",
    description: "OAuth 2.0 client ID from Google Cloud Console.",
    inputType: "text"
  },
  auth_google_client_secret: {
    key: "auth_google_client_secret",
    label: "Google Client Secret",
    description: "OAuth 2.0 client secret from Google Cloud Console.",
    inputType: "secret"
  },
  // Apple OAuth
  auth_apple_enabled: {
    key: "auth_apple_enabled",
    label: "Enable Sign in with Apple",
    description: "Allow users to authenticate with their Apple ID.",
    inputType: "boolean"
  },
  auth_apple_client_id: {
    key: "auth_apple_client_id",
    label: "Apple Services ID",
    description: "The Services ID configured in your Apple Developer account.",
    inputType: "text"
  },
  auth_apple_team_id: {
    key: "auth_apple_team_id",
    label: "Apple Team ID",
    description: "Your Apple Developer Team ID.",
    inputType: "text"
  },
  auth_apple_key_id: {
    key: "auth_apple_key_id",
    label: "Apple Key ID",
    description: "The Key ID for your Sign in with Apple private key.",
    inputType: "text"
  },
  auth_apple_private_key: {
    key: "auth_apple_private_key",
    label: "Apple Private Key",
    description: "The private key file contents (PEM format) for Sign in with Apple.",
    inputType: "secret",
    multiline: !0
  },
  // Solana auth
  auth_solana_enabled: {
    key: "auth_solana_enabled",
    label: "Enable Solana Wallet Auth",
    description: "Allow users to authenticate by signing with their Solana wallet.",
    inputType: "boolean"
  },
  auth_solana_challenge_expiry: {
    key: "auth_solana_challenge_expiry",
    label: "Challenge Expiry",
    description: "How long a wallet signature challenge is valid.",
    inputType: "duration",
    min: 60,
    presets: [
      { label: "1 minute", value: "60" },
      { label: "5 minutes", value: "300" },
      { label: "10 minutes", value: "600" }
    ]
  },
  // WebAuthn/Passkeys
  auth_webauthn_enabled: {
    key: "auth_webauthn_enabled",
    label: "Enable WebAuthn/Passkeys",
    description: "Allow passwordless authentication with FIDO2/WebAuthn credentials.",
    inputType: "boolean"
  },
  auth_webauthn_rp_id: {
    key: "auth_webauthn_rp_id",
    label: "Relying Party ID",
    description: "Usually your domain (e.g., example.com). Passkeys are bound to this.",
    inputType: "text"
  },
  auth_webauthn_rp_name: {
    key: "auth_webauthn_rp_name",
    label: "Relying Party Name",
    description: "Display name shown to users during passkey registration.",
    inputType: "text"
  },
  auth_webauthn_rp_origin: {
    key: "auth_webauthn_rp_origin",
    label: "Allowed Origins",
    description: "Comma-separated origins allowed for WebAuthn (e.g., https://example.com).",
    inputType: "text"
  },
  // ============= Feature Flags =============
  feature_privacy_cash: {
    key: "feature_privacy_cash",
    label: "Privacy Cash",
    description: "Enable Privacy Cash deposits and timed withdrawals.",
    inputType: "boolean"
  },
  feature_wallet_signing: {
    key: "feature_wallet_signing",
    label: "Embedded Wallet Signing",
    description: "Enable the embedded wallet for transaction signing.",
    inputType: "boolean"
  },
  feature_sso: {
    key: "feature_sso",
    label: "Enterprise SSO",
    description: "Enable SAML/OIDC single sign-on for enterprise customers.",
    inputType: "boolean"
  },
  feature_organizations: {
    key: "feature_organizations",
    label: "Organizations",
    description: "Enable multi-user organizations with role-based access.",
    inputType: "boolean"
  },
  feature_mfa: {
    key: "feature_mfa",
    label: "Two-Factor Authentication",
    description: "Allow users to enable TOTP-based two-factor authentication.",
    inputType: "boolean"
  },
  feature_instant_link: {
    key: "feature_instant_link",
    label: "Instant Link Login",
    description: "Allow passwordless login via magic link sent to email.",
    inputType: "boolean"
  },
  // ============= Security Settings =============
  security_cors_origins: {
    key: "security_cors_origins",
    label: "CORS Origins",
    description: "Allowed origins for cross-origin requests (comma-separated). Empty = same origin only.",
    inputType: "text"
  },
  security_cookie_domain: {
    key: "security_cookie_domain",
    label: "Cookie Domain",
    description: "Domain for auth cookies. Empty uses the request origin.",
    inputType: "text"
  },
  security_cookie_secure: {
    key: "security_cookie_secure",
    label: "Secure Cookies",
    description: "Require HTTPS for cookies. Disable only for local development.",
    inputType: "boolean"
  },
  security_cookie_same_site: {
    key: "security_cookie_same_site",
    label: "Cookie SameSite",
    description: 'SameSite policy for cookies. Use "none" only if needed for cross-site embeds.',
    inputType: "select",
    presets: [
      { label: "Strict", value: "strict" },
      { label: "Lax (Recommended)", value: "lax" },
      { label: "None (cross-site)", value: "none" }
    ]
  },
  security_session_timeout: {
    key: "security_session_timeout",
    label: "Session Timeout",
    description: "How long sessions remain valid before requiring re-authentication.",
    inputType: "duration",
    min: 300,
    presets: [
      { label: "1 hour", value: "3600" },
      { label: "24 hours", value: "86400" },
      { label: "7 days", value: "604800" },
      { label: "30 days", value: "2592000" }
    ]
  },
  security_jwt_issuer: {
    key: "security_jwt_issuer",
    label: "JWT Issuer",
    description: "Issuer claim for JWTs. Empty uses the server URL.",
    inputType: "text"
  },
  security_jwt_audience: {
    key: "security_jwt_audience",
    label: "JWT Audience",
    description: "Audience claim for JWTs. Empty uses default.",
    inputType: "text"
  },
  // ============= Email/SMTP Settings =============
  email_smtp_host: {
    key: "email_smtp_host",
    label: "SMTP Host",
    description: "SMTP server hostname (e.g., smtp.sendgrid.net).",
    inputType: "text"
  },
  email_smtp_port: {
    key: "email_smtp_port",
    label: "SMTP Port",
    description: "SMTP server port. Common: 587 (TLS), 465 (SSL), 25 (unencrypted).",
    inputType: "select",
    presets: [
      { label: "587 (TLS)", value: "587" },
      { label: "465 (SSL)", value: "465" },
      { label: "25 (Plain)", value: "25" }
    ]
  },
  email_smtp_user: {
    key: "email_smtp_user",
    label: "SMTP Username",
    description: "Username for SMTP authentication.",
    inputType: "text"
  },
  email_smtp_password: {
    key: "email_smtp_password",
    label: "SMTP Password",
    description: "Password or API key for SMTP authentication.",
    inputType: "secret"
  },
  email_smtp_tls: {
    key: "email_smtp_tls",
    label: "Use TLS",
    description: "Enable TLS encryption for SMTP connections.",
    inputType: "boolean"
  },
  email_from_address: {
    key: "email_from_address",
    label: "From Address",
    description: "Default sender email address (e.g., noreply@example.com).",
    inputType: "text"
  },
  email_from_name: {
    key: "email_from_name",
    label: "From Name",
    description: 'Default sender display name (e.g., "My App").',
    inputType: "text"
  },
  // ============= Webhook Settings =============
  webhook_enabled: {
    key: "webhook_enabled",
    label: "Enable Webhooks",
    description: "Send HTTP notifications for auth events (signup, login, etc.).",
    inputType: "boolean"
  },
  webhook_url: {
    key: "webhook_url",
    label: "Webhook URL",
    description: "Endpoint to receive webhook POST requests.",
    inputType: "text"
  },
  webhook_secret: {
    key: "webhook_secret",
    label: "Webhook Secret",
    description: "Secret used to sign webhook payloads (HMAC-SHA256).",
    inputType: "secret"
  },
  webhook_timeout: {
    key: "webhook_timeout",
    label: "Timeout",
    description: "Maximum time to wait for webhook response.",
    inputType: "duration",
    min: 5,
    presets: [
      { label: "10 seconds", value: "10" },
      { label: "30 seconds", value: "30" },
      { label: "60 seconds", value: "60" }
    ]
  },
  webhook_retries: {
    key: "webhook_retries",
    label: "Max Retries",
    description: "Number of retry attempts for failed webhooks.",
    inputType: "select",
    presets: [
      { label: "0 (No retries)", value: "0" },
      { label: "3 (Recommended)", value: "3" },
      { label: "5", value: "5" }
    ]
  },
  // ============= Server Settings =============
  server_frontend_url: {
    key: "server_frontend_url",
    label: "Frontend URL",
    description: "URL of your frontend app (for redirects and email links).",
    inputType: "text"
  },
  server_base_path: {
    key: "server_base_path",
    label: "Base Path",
    description: "Base path for auth endpoints (e.g., /auth).",
    inputType: "text"
  },
  server_trust_proxy: {
    key: "server_trust_proxy",
    label: "Trust Proxy",
    description: "Trust X-Forwarded-For headers. Enable if behind a reverse proxy.",
    inputType: "boolean"
  },
  // ============= Privacy Settings (existing) =============
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
}, ea = {
  // Auth providers (sorted alphabetically by subcategory)
  "auth.apple": {
    label: "Apple Sign-In",
    description: "Configure Sign in with Apple OAuth integration.",
    icon: ""
  },
  "auth.email": {
    label: "Email Authentication",
    description: "Configure email/password authentication settings.",
    icon: ""
  },
  "auth.google": {
    label: "Google Sign-In",
    description: "Configure Google OAuth integration.",
    icon: ""
  },
  "auth.solana": {
    label: "Solana Wallet Auth",
    description: "Configure Solana wallet signature authentication.",
    icon: ""
  },
  "auth.webauthn": {
    label: "WebAuthn / Passkeys",
    description: "Configure FIDO2/WebAuthn passwordless authentication.",
    icon: ""
  },
  deposit: {
    label: "Deposit Settings",
    description: "Configure token lists and deposit flow display options.",
    icon: ""
  },
  email: {
    label: "Email / SMTP",
    description: "Configure outbound email delivery for verification, password reset, and notifications.",
    icon: ""
  },
  features: {
    label: "Feature Flags",
    description: "Enable or disable major platform features.",
    icon: ""
  },
  privacy: {
    label: "Privacy Settings",
    description: "Control the privacy period for deposits. Longer periods provide better timing privacy but delay fund availability.",
    icon: ""
  },
  rate_limit: {
    label: "Rate Limiting",
    description: "Protect the system from abuse by limiting request rates. Balance security with user experience.",
    icon: ""
  },
  security: {
    label: "Security",
    description: "Configure CORS, cookies, sessions, and JWT settings.",
    icon: ""
  },
  server: {
    label: "Server",
    description: "Server infrastructure settings. Some may be overridden by environment variables.",
    icon: ""
  },
  webhook: {
    label: "Webhooks",
    description: "Configure HTTP webhook notifications for auth events.",
    icon: ""
  },
  withdrawal: {
    label: "Withdrawal Worker",
    description: "Configure how the automated withdrawal processor handles pending withdrawals. These settings affect throughput and privacy.",
    icon: ""
  }
};
function bl({
  showDescriptions: t = !0,
  className: r = "",
  onSave: o
}) {
  const { settings: a, isLoading: s, isUpdating: n, error: c, fetchSettings: l, updateSettings: d } = oo(), [u, p] = k({}), [f, h] = k(null), [w, g] = k(!1);
  F(() => {
    l();
  }, [l]), F(() => {
    if (w) {
      const T = setTimeout(() => g(!1), 3e3);
      return () => clearTimeout(T);
    }
  }, [w]);
  const m = C((T, A) => {
    p((S) => ({ ...S, [T]: A })), h(null), g(!1);
  }, []), b = C(async () => {
    const T = Object.entries(u).map(([A, S]) => ({
      key: A,
      value: S
    }));
    if (T.length !== 0)
      try {
        await d(T), p({}), h(null), g(!0), o?.();
      } catch (A) {
        h(A instanceof Error ? A.message : "Failed to save settings");
      }
  }, [u, d, o]), v = C(() => {
    p({}), h(null), g(!1);
  }, []), y = Object.keys(u).length > 0, N = Object.keys(u).length;
  if (s && Object.keys(a).length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
      /* @__PURE__ */ e(K, {}),
      /* @__PURE__ */ e("span", { children: "Loading settings..." })
    ] });
  if (c)
    return /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ e(ee, { error: c.message }) });
  const E = Object.keys(a).sort();
  return E.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-system-settings cedros-system-settings-empty ${r}`, children: /* @__PURE__ */ e("p", { children: "No system settings found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${r}`, children: [
    f && /* @__PURE__ */ e(ee, { error: f }),
    w && /* @__PURE__ */ e("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    E.map((T) => /* @__PURE__ */ e(
      ta,
      {
        category: T,
        settings: a[T],
        edits: u,
        showDescription: t,
        onChange: m
      },
      T
    )),
    /* @__PURE__ */ i("div", { className: "cedros-system-settings-actions", children: [
      y && /* @__PURE__ */ i("span", { className: "cedros-settings-change-count", children: [
        N,
        " unsaved change",
        N !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: v,
          disabled: !y || n,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: b,
          disabled: !y || n,
          children: n ? /* @__PURE__ */ e(K, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
function ta({
  category: t,
  settings: r,
  edits: o,
  showDescription: a,
  onChange: s
}) {
  const n = ea[t] || {
    label: t,
    description: "",
    icon: "⚙️"
  };
  return /* @__PURE__ */ i("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-settings-section-icon", children: n.icon }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("h3", { className: "cedros-settings-section-title", children: n.label }),
        a && n.description && /* @__PURE__ */ e("p", { className: "cedros-settings-section-description", children: n.description })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-settings-grid", children: r.map((c) => /* @__PURE__ */ e(
      ra,
      {
        setting: c,
        editValue: o[c.key],
        onChange: s
      },
      c.key
    )) })
  ] });
}
function ra({ setting: t, editValue: r, onChange: o }) {
  const a = Zn[t.key], s = r ?? t.value, n = r !== void 0 && r !== t.value, c = O(() => {
    if (!a?.warningThreshold) return null;
    const l = parseInt(s, 10);
    if (isNaN(l)) return null;
    const { above: d, below: u, message: p } = a.warningThreshold;
    return d !== void 0 && l > d || u !== void 0 && l < u ? p : null;
  }, [s, a?.warningThreshold]);
  return a ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-setting-row ${n ? "cedros-setting-row-changed" : ""} ${c ? "cedros-setting-row-warning" : ""}`,
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-setting-label", children: [
          /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: a.label }),
          /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: a.description })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-setting-control", children: [
          a.inputType === "duration" && /* @__PURE__ */ e(
            sa,
            {
              value: s,
              onChange: (l) => o(t.key, l),
              presets: a.presets,
              min: a.min
            }
          ),
          a.inputType === "percentage" && /* @__PURE__ */ e(
            oa,
            {
              value: s,
              onChange: (l) => o(t.key, l),
              min: a.min ?? 1,
              max: a.max ?? 100,
              step: a.step ?? 5,
              presets: a.presets
            }
          ),
          a.inputType === "select" && /* @__PURE__ */ e(
            na,
            {
              value: s,
              onChange: (l) => o(t.key, l),
              presets: a.presets ?? [],
              unit: a.unit
            }
          ),
          a.inputType === "number" && /* @__PURE__ */ e(
            aa,
            {
              value: s,
              onChange: (l) => o(t.key, l),
              min: a.min,
              max: a.max,
              unit: a.unit
            }
          ),
          a.inputType === "tokenList" && /* @__PURE__ */ e(ca, { value: s, onChange: (l) => o(t.key, l) }),
          a.inputType === "text" && /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              value: s,
              onChange: (l) => o(t.key, l.target.value),
              className: "cedros-setting-input",
              placeholder: a.label
            }
          ),
          a.inputType === "boolean" && /* @__PURE__ */ e(ia, { value: s, onChange: (l) => o(t.key, l) }),
          a.inputType === "secret" && /* @__PURE__ */ e(
            la,
            {
              value: s,
              onChange: (l) => o(t.key, l),
              multiline: a.multiline
            }
          ),
          a.inputType === "tokenSymbolList" && /* @__PURE__ */ e(
            da,
            {
              value: s,
              onChange: (l) => o(t.key, l)
            }
          ),
          c && /* @__PURE__ */ e("div", { className: "cedros-setting-warning", children: c })
        ] })
      ]
    }
  ) : /* @__PURE__ */ i("div", { className: `cedros-setting-row ${n ? "cedros-setting-row-changed" : ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-setting-label", children: [
      /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: t.key }),
      t.description && /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: t.description })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-setting-input-wrapper", children: /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: s,
        onChange: (l) => o(t.key, l.target.value),
        className: "cedros-setting-input"
      }
    ) })
  ] });
}
function sa({ value: t, onChange: r, presets: o, min: a = 0 }) {
  const s = parseInt(t, 10) || 0, n = Xn(s), c = C(
    (d) => {
      d.target.value && r(d.target.value);
    },
    [r]
  ), l = C(
    (d) => {
      const u = Math.max(a, parseInt(d.target.value, 10) || 0);
      r(String(u));
    },
    [r, a]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-duration-input", children: [
    o && o.length > 0 && /* @__PURE__ */ i(
      "select",
      {
        value: o.find((d) => d.value === t)?.value ?? "",
        onChange: c,
        className: "cedros-setting-select",
        children: [
          /* @__PURE__ */ e("option", { value: "", children: "Custom..." }),
          o.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
        ]
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-duration-custom", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "number",
          value: s,
          onChange: l,
          min: a,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: "seconds" }),
      /* @__PURE__ */ i("span", { className: "cedros-duration-display", children: [
        "= ",
        n
      ] })
    ] })
  ] });
}
function oa({ value: t, onChange: r, min: o, max: a, step: s, presets: n }) {
  const c = parseInt(t, 10) || o, l = C(
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
          value: c,
          onChange: l,
          min: o,
          max: a,
          step: s,
          className: "cedros-percentage-slider"
        }
      ),
      /* @__PURE__ */ i("span", { className: "cedros-percentage-value", children: [
        c,
        "%"
      ] })
    ] }),
    n && n.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-preset-buttons", children: n.map((u) => /* @__PURE__ */ e(
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
function na({ value: t, onChange: r, presets: o, unit: a }) {
  const s = !o.some((l) => l.value === t), n = C(
    (l) => {
      l.target.value !== "__custom__" && r(l.target.value);
    },
    [r]
  ), c = C(
    (l) => {
      r(l.target.value);
    },
    [r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-select-input", children: [
    /* @__PURE__ */ i(
      "select",
      {
        value: s ? "__custom__" : t,
        onChange: n,
        className: "cedros-setting-select",
        children: [
          o.map((l) => /* @__PURE__ */ e("option", { value: l.value, children: l.label }, l.value)),
          /* @__PURE__ */ e("option", { value: "__custom__", children: "Custom..." })
        ]
      }
    ),
    s && /* @__PURE__ */ i("div", { className: "cedros-select-custom", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "number",
          value: t,
          onChange: c,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      a && /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: a })
    ] })
  ] });
}
function aa({ value: t, onChange: r, min: o, max: a, unit: s }) {
  const n = C(
    (c) => {
      r(c.target.value);
    },
    [r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-number-input", children: [
    /* @__PURE__ */ e(
      "input",
      {
        type: "number",
        value: t,
        onChange: n,
        min: o,
        max: a,
        className: "cedros-setting-input"
      }
    ),
    s && /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: s })
  ] });
}
function ia({ value: t, onChange: r }) {
  const o = t === "true", a = C(() => {
    r(o ? "false" : "true");
  }, [o, r]);
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": o,
      className: `cedros-toggle ${o ? "cedros-toggle-on" : "cedros-toggle-off"}`,
      onClick: a,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
        /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: o ? "Enabled" : "Disabled" })
      ]
    }
  );
}
function la({ value: t, onChange: r, multiline: o }) {
  const [a, s] = k(!1), [n, c] = k(!1), l = t && t.length > 0, d = C(() => {
    s(!0), c(!0);
  }, []), u = C(() => {
    s(!1), c(!1);
  }, []), p = C(
    (f) => {
      r(f.target.value);
    },
    [r]
  );
  return !a && l ? /* @__PURE__ */ i("div", { className: "cedros-secret-input cedros-secret-input-masked", children: [
    /* @__PURE__ */ e("span", { className: "cedros-secret-masked", children: "•".repeat(Math.min(t.length, 20)) }),
    /* @__PURE__ */ e("button", { type: "button", className: "cedros-secret-edit-btn", onClick: d, children: "Edit" })
  ] }) : /* @__PURE__ */ i("div", { className: "cedros-secret-input", children: [
    o ? /* @__PURE__ */ e(
      "textarea",
      {
        value: t,
        onChange: p,
        className: "cedros-setting-input cedros-setting-textarea",
        placeholder: "Enter secret value...",
        rows: 4
      }
    ) : /* @__PURE__ */ e(
      "input",
      {
        type: n ? "text" : "password",
        value: t,
        onChange: p,
        className: "cedros-setting-input",
        placeholder: "Enter secret value..."
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-secret-actions", children: [
      !o && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-secret-toggle-btn",
          onClick: () => c(!n),
          children: n ? "Hide" : "Show"
        }
      ),
      a && /* @__PURE__ */ e("button", { type: "button", className: "cedros-secret-done-btn", onClick: u, children: "Done" })
    ] })
  ] });
}
const is = [
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
function ca({ value: t, onChange: r }) {
  const o = O(() => {
    try {
      return JSON.parse(t || "[]");
    } catch {
      return [];
    }
  }, [t]), a = C(
    (l) => {
      r(JSON.stringify(l));
    },
    [r]
  ), s = C(() => {
    a([...o, { symbol: "", mint: "", decimals: 6 }]);
  }, [o, a]), n = C(
    (l, d, u) => {
      const p = [...o];
      p[l] = { ...p[l], [d]: u }, a(p);
    },
    [o, a]
  ), c = C(
    (l) => {
      a(o.filter((d, u) => u !== l));
    },
    [o, a]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-token-list-input", children: [
    /* @__PURE__ */ i("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ e("span", { className: "cedros-token-presets-label", children: "Built-in tokens:" }),
      /* @__PURE__ */ e("div", { className: "cedros-token-presets-list", children: is.map((l) => /* @__PURE__ */ e("span", { className: "cedros-token-preset-chip", children: l }, l)) })
    ] }),
    o.length === 0 && /* @__PURE__ */ e("p", { className: "cedros-token-list-empty", children: "No custom tokens added. Use the built-in tokens above or add your own." }),
    o.map((l, d) => /* @__PURE__ */ i("div", { className: "cedros-token-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-token-row-fields", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Symbol",
            value: l.symbol,
            onChange: (u) => n(d, "symbol", u.target.value.toUpperCase()),
            className: "cedros-setting-input cedros-token-input-symbol",
            maxLength: 10
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Mint address",
            value: l.mint,
            onChange: (u) => n(d, "mint", u.target.value),
            className: "cedros-setting-input cedros-token-input-mint"
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            placeholder: "Decimals",
            value: l.decimals,
            onChange: (u) => n(d, "decimals", parseInt(u.target.value, 10) || 0),
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
            value: l.logoUrl || "",
            onChange: (u) => n(d, "logoUrl", u.target.value || void 0),
            className: "cedros-setting-input cedros-token-input-logo"
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-token-remove-btn",
          onClick: () => c(d),
          title: "Remove token",
          children: "×"
        }
      )
    ] }, d)),
    /* @__PURE__ */ e("button", { type: "button", className: "cedros-token-add-btn", onClick: s, children: "+ Add Token" })
  ] });
}
function da({ value: t, onChange: r }) {
  const o = O(() => t.split(",").map((n) => n.trim()).filter(Boolean), [t]), a = C(
    (n) => {
      if (!n || o.includes(n)) return;
      const c = [...o, n].join(", ");
      r(c);
    },
    [o, r]
  ), s = C(
    (n) => {
      const c = o.filter((l) => l !== n).join(", ");
      r(c);
    },
    [o, r]
  );
  return /* @__PURE__ */ i("div", { className: "cedros-token-symbol-list-input", children: [
    /* @__PURE__ */ i("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ e("span", { className: "cedros-token-presets-label", children: "Click to add:" }),
      /* @__PURE__ */ e("div", { className: "cedros-token-presets-list", children: is.map((n) => {
        const c = o.includes(n);
        return /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: `cedros-token-preset-chip ${c ? "cedros-token-preset-chip-selected" : ""}`,
            onClick: () => c ? s(n) : a(n),
            title: c ? `Remove ${n}` : `Add ${n}`,
            children: [
              n,
              c && /* @__PURE__ */ e("span", { className: "cedros-token-chip-check", children: "✓" })
            ]
          },
          n
        );
      }) })
    ] }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: t,
        onChange: (n) => r(n.target.value),
        className: "cedros-setting-input",
        placeholder: "USDC, SOL, BONK..."
      }
    )
  ] });
}
class ua {
  client;
  constructor(r, o, a) {
    this.client = new ue({ baseUrl: r, timeoutMs: o, retryAttempts: a });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (r) {
      throw q(r, "Failed to check setup status");
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
      throw q(o, "Failed to create admin account");
    }
  }
}
function ls() {
  const { config: t } = ne(), [r, o] = k(null), [a, s] = k(!1), [n, c] = k(!1), [l, d] = k(null), u = $(0), p = O(
    () => new ua(t.serverUrl, t.requestTimeout, t.retryAttempts),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), f = $(p);
  f.current = p;
  const h = C(async () => {
    s(!0), d(null);
    const g = ++u.current;
    try {
      const m = await f.current.getStatus();
      if (g !== u.current) return;
      o(m);
    } catch (m) {
      if (g !== u.current) return;
      d(m instanceof Error ? m : new Error("Failed to check setup status"));
    } finally {
      g === u.current && s(!1);
    }
  }, []), w = C(
    async (g) => {
      c(!0), d(null);
      try {
        const m = await f.current.createFirstAdmin(g);
        return await h(), m;
      } catch (m) {
        const b = m instanceof Error ? m : new Error("Failed to create admin");
        throw d(b), b;
      } finally {
        c(!1);
      }
    },
    [h]
  );
  return {
    status: r,
    isLoading: a,
    isCreating: n,
    error: l,
    checkStatus: h,
    createAdmin: w
  };
}
const ha = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, tr = 8;
function pa(t) {
  const r = {};
  return t.email ? ha.test(t.email) || (r.email = "Invalid email format") : r.email = "Email is required", t.password ? t.password.length < tr && (r.password = `Password must be at least ${tr} characters`) : r.password = "Password is required", t.confirmPassword ? t.password !== t.confirmPassword && (r.confirmPassword = "Passwords do not match") : r.confirmPassword = "Please confirm your password", r;
}
function ma({ onComplete: t, className: r = "" }) {
  const { status: o, isLoading: a, isCreating: s, error: n, checkStatus: c, createAdmin: l } = ls(), [d, u] = k({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [p, f] = k({}), [h, w] = k(!1);
  F(() => {
    c();
  }, [c]);
  const g = C(
    (b) => (v) => {
      u((y) => ({ ...y, [b]: v.target.value })), f((y) => ({ ...y, [b]: void 0 }));
    },
    []
  ), m = C(
    async (b) => {
      b.preventDefault();
      const v = pa(d);
      if (Object.keys(v).length > 0) {
        f(v);
        return;
      }
      try {
        await l({
          email: d.email,
          password: d.password,
          name: d.name || void 0,
          orgName: d.orgName || void 0
        }), w(!0), t?.();
      } catch {
      }
    },
    [d, l, t]
  );
  return a ? /* @__PURE__ */ e("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ e(K, {}),
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
  ] }) }) : h ? /* @__PURE__ */ e("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__complete", children: [
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
    /* @__PURE__ */ i("form", { className: "cedros-setup__form", onSubmit: m, children: [
      n && /* @__PURE__ */ e(ee, { error: n.message }),
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
            className: `cedros-setup__input ${p.email ? "cedros-setup__input--error" : ""}`,
            value: d.email,
            onChange: g("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: s
          }
        ),
        p.email && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: p.email })
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
            onChange: g("name"),
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
            onChange: g("orgName"),
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
            className: `cedros-setup__input ${p.password ? "cedros-setup__input--error" : ""}`,
            value: d.password,
            onChange: g("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        p.password && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: p.password })
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
            className: `cedros-setup__input ${p.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: d.confirmPassword,
            onChange: g("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        p.confirmPassword && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: p.confirmPassword })
      ] }),
      /* @__PURE__ */ e("button", { type: "submit", className: "cedros-setup__button", disabled: s, children: s ? /* @__PURE__ */ i(X, { children: [
        /* @__PURE__ */ e(K, {}),
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
const fa = ["security", "rate_limit"];
function Al({ className: t }) {
  return /* @__PURE__ */ e(
    To,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: fa,
      className: t
    }
  );
}
const rr = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
], ga = {
  mailgun: "smtp.mailgun.org",
  sendgrid: "smtp.sendgrid.net",
  postmark: "smtp.postmarkapp.com",
  ses: "email-smtp.us-east-1.amazonaws.com",
  resend: "smtp.resend.com"
}, wa = [
  "email_provider",
  "email_smtp_password",
  // API key
  "email_from_address",
  "email_from_name"
], ya = [
  "email_provider",
  "email_smtp_host",
  "email_smtp_port",
  "email_smtp_user",
  "email_smtp_password",
  "email_smtp_tls",
  "email_from_address",
  "email_from_name"
];
function ba({ className: t }) {
  const {
    settings: r,
    edits: o,
    isLoading: a,
    autosaveStatus: s,
    autosaveError: n,
    error: c,
    fetchSettings: l,
    handleChange: d,
    getEffectiveValue: u
  } = Ao(), [p, f] = k("email");
  F(() => {
    l();
  }, [l]);
  const h = rr.find((y) => y.id === p), w = h?.category ?? "", m = (u("email_provider") || "custom") === "custom", b = O(() => {
    const y = r[w] ?? [];
    if (p !== "email") return y;
    const N = m ? ya : wa;
    return y.filter((E) => N.includes(E.key)).sort((E, T) => N.indexOf(E.key) - N.indexOf(T.key));
  }, [r, w, p, m]), v = (y, N) => {
    if (d(y, N), y === "email_provider" && N !== "custom") {
      const E = ga[N];
      E && (d("email_smtp_host", E), d("email_smtp_port", "587"), d("email_smtp_tls", "true"));
    }
  };
  return a && Object.keys(r).length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${t ?? ""}`, children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : c ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${t ?? ""}`, children: /* @__PURE__ */ e(ee, { error: c.message }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${t ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure email delivery and webhook notifications." })
      ] }),
      /* @__PURE__ */ e(vo, { status: s, error: n })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: rr.map((y) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${p === y.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => f(y.id),
        "aria-selected": p === y.id,
        role: "tab",
        children: y.label
      },
      y.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: b.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ i("p", { children: [
      "No settings found for ",
      h?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ e(
      ko,
      {
        settings: b,
        edits: o,
        onChange: p === "email" ? v : d
      }
    ) })
  ] });
}
const de = {
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
}, Aa = [
  // Top-level menu items
  { id: "users", label: "Users", icon: de.users },
  { id: "team", label: "Team", icon: de.members },
  { id: "deposits", label: "Deposits", icon: de.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: de.withdrawals, requiredFeature: "credits" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: de.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: de.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: de.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: de.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-server", label: "Auth Server", icon: de.server, group: "Configuration" }
];
function vl({
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
  onSettingsClick: c,
  onLogoutClick: l,
  className: d = ""
}) {
  const [u, p] = k(o), [f, h] = k(!0), { user: w, logout: g } = ne(), { activeOrg: m, role: b, isLoading: v, fetchOrgs: y, hasPermission: N } = no(), { status: E, isLoading: T, checkStatus: A } = ls(), { features: S, isLoading: P } = $s(), { canAccess: x } = Js(), M = C(
    (I) => {
      p(I), n?.(I);
    },
    [n]
  ), _ = Aa.filter((I) => !(!r.includes(I.id) || I.requiredFeature && !S[I.requiredFeature] || !x(I.id))), L = _.find((I) => I.id === u), B = !L && !P;
  return F(() => {
    y(), A();
  }, [y, A]), F(() => {
    B && _.length > 0 && p("users");
  }, [B, _.length]), !T && E?.needsSetup ? /* @__PURE__ */ e("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${d}`, children: /* @__PURE__ */ e(ma, { onComplete: () => A() }) }) : (v || T || P) && !m ? /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${d}`, children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !m ? /* @__PURE__ */ e("div", { className: `cedros-admin cedros-dashboard ${d}`, children: /* @__PURE__ */ e(ee, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard ${d}`, children: [
    /* @__PURE__ */ i("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__logo", children: [
        de.wallet,
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__logo-text", children: t })
      ] }) }),
      /* @__PURE__ */ i("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          _.filter((I) => !I.group).map((I) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === I.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => M(I.id),
              "aria-current": u === I.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: I.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: I.label })
              ]
            },
            I.id
          ))
        ] }),
        _.some((I) => I.group === "Configuration") && /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: "cedros-dashboard__nav-label cedros-dashboard__nav-label--collapsible",
              onClick: () => h(!f),
              "aria-expanded": f,
              children: [
                /* @__PURE__ */ e("span", { children: "Configuration" }),
                /* @__PURE__ */ e(
                  "span",
                  {
                    className: `cedros-dashboard__nav-chevron ${f ? "cedros-dashboard__nav-chevron--expanded" : ""}`,
                    children: de.chevronRight
                  }
                )
              ]
            }
          ),
          f && _.filter((I) => I.group === "Configuration").map((I) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === I.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => M(I.id),
              "aria-current": u === I.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: I.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: I.label })
              ]
            },
            I.id
          ))
        ] })
      ] }),
      w && /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ e(
        wo,
        {
          name: w.name,
          email: w.email,
          picture: w.picture,
          onSettings: c,
          onLogout: l ?? g
        }
      ) })
    ] }),
    /* @__PURE__ */ i("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ e("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-root", children: t }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-sep", children: de.chevronRight }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-current", children: L?.label })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ e(va, { pageSize: s, currentUserId: w?.id }),
        u === "team" && m && /* @__PURE__ */ e(
          ka,
          {
            orgId: m.id,
            currentUserId: w?.id,
            hasPermission: N,
            role: b
          }
        ),
        u === "deposits" && /* @__PURE__ */ e(Na, { pageSize: s, refreshInterval: a }),
        u === "withdrawals" && /* @__PURE__ */ e(Ca, { pageSize: s, refreshInterval: a }),
        u === "settings-auth" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(yo, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(bo, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(ba, {}) }),
        u === "settings-credits" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(No, {}) }),
        u === "settings-server" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(Co, {}) })
      ] })
    ] })
  ] });
}
function va({ pageSize: t, currentUserId: r }) {
  const [o, a] = k(null), { statsItems: s, isLoading: n, error: c, refresh: l } = mo();
  return o ? /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
    fo,
    {
      userId: o.id,
      currentUserId: r,
      onBack: () => a(null)
    }
  ) }) : /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ e(Hr, { stats: s, isLoading: n, onRefresh: l }),
    c && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: c }),
    /* @__PURE__ */ e(
      go,
      {
        pageSize: t,
        currentUserId: r,
        onUserClick: (d) => a(d)
      }
    )
  ] });
}
function ka({ orgId: t, currentUserId: r, hasPermission: o, role: a }) {
  const [s, n] = k("members"), {
    members: c,
    isLoading: l,
    error: d,
    fetchMembers: u,
    updateMemberRole: p,
    removeMember: f
  } = Xs(t), {
    invites: h,
    isLoading: w,
    error: g,
    fetchInvites: m,
    createInvite: b,
    cancelInvite: v,
    resendInvite: y
  } = Zs(t);
  F(() => {
    u(), m();
  }, [u, m]);
  const N = o("invite:create"), E = o("invite:cancel"), T = h.length, A = c.reduce(
    (M, _) => (M[_.role] = (M[_.role] ?? 0) + 1, M),
    {}
  ), S = A.owner ?? 0, P = A.admin ?? 0, x = A.member ?? 0;
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ e(
      Hr,
      {
        stats: [
          { label: "Owners", value: S },
          { label: "Admins", value: P },
          { label: "Members", value: x },
          { label: "Pending Invites", value: T }
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
            T > 0 && ` (${T})`
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
        eo,
        {
          members: c,
          currentUserId: r,
          isLoading: l,
          error: d?.message,
          canManage: o("member:remove"),
          canChangeRoles: o("member:role_change"),
          onUpdateRole: p,
          onRemove: f
        }
      ),
      s === "invites" && /* @__PURE__ */ i("div", { className: "cedros-dashboard__invites", children: [
        N && /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ e(
            to,
            {
              onSubmit: b,
              isLoading: w,
              error: g?.message
            }
          )
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
          ro,
          {
            invites: h,
            isLoading: w,
            error: g?.message,
            canManage: E || N,
            onCancel: E ? v : void 0,
            onResend: N ? y : void 0
          }
        ) })
      ] }),
      s === "permissions" && a === "owner" && /* @__PURE__ */ e(so, { userRole: a })
    ] })
  ] });
}
function Na({ pageSize: t, refreshInterval: r }) {
  const [o, a] = k("");
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ e(io, { refreshInterval: r }),
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
        lo,
        {
          statusFilter: o || void 0,
          pageSize: t,
          refreshInterval: r
        }
      )
    ] })
  ] });
}
function Ca({ pageSize: t, refreshInterval: r }) {
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ e(co, { refreshInterval: r }),
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ e(uo, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(ho, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(po, { pageSize: t, refreshInterval: r })
    ] })
  ] });
}
var Ee = {}, at, sr;
function Ea() {
  return sr || (sr = 1, at = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), at;
}
var it = {}, Ae = {}, or;
function ke() {
  if (or) return Ae;
  or = 1;
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
var lt = {}, nr;
function qt() {
  return nr || (nr = 1, (function(t) {
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
  })(lt)), lt;
}
var ct, ar;
function Sa() {
  if (ar) return ct;
  ar = 1;
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
  }, ct = t, ct;
}
var dt, ir;
function xa() {
  if (ir) return dt;
  ir = 1;
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
  }, dt = t, dt;
}
var ut = {}, lr;
function Pa() {
  return lr || (lr = 1, (function(t) {
    const r = ke().getSymbolSize;
    t.getRowColCoords = function(a) {
      if (a === 1) return [];
      const s = Math.floor(a / 7) + 2, n = r(a), c = n === 145 ? 26 : Math.ceil((n - 13) / (2 * s - 2)) * 2, l = [n - 7];
      for (let d = 1; d < s - 1; d++)
        l[d] = l[d - 1] - c;
      return l.push(6), l.reverse();
    }, t.getPositions = function(a) {
      const s = [], n = t.getRowColCoords(a), c = n.length;
      for (let l = 0; l < c; l++)
        for (let d = 0; d < c; d++)
          l === 0 && d === 0 || // top-left
          l === 0 && d === c - 1 || // bottom-left
          l === c - 1 && d === 0 || s.push([n[l], n[d]]);
      return s;
    };
  })(ut)), ut;
}
var ht = {}, cr;
function Ta() {
  if (cr) return ht;
  cr = 1;
  const t = ke().getSymbolSize, r = 7;
  return ht.getPositions = function(a) {
    const s = t(a);
    return [
      // top-left
      [0, 0],
      // top-right
      [s - r, 0],
      // bottom-left
      [0, s - r]
    ];
  }, ht;
}
var pt = {}, dr;
function La() {
  return dr || (dr = 1, (function(t) {
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
      let c = 0, l = 0, d = 0, u = null, p = null;
      for (let f = 0; f < n; f++) {
        l = d = 0, u = p = null;
        for (let h = 0; h < n; h++) {
          let w = s.get(f, h);
          w === u ? l++ : (l >= 5 && (c += r.N1 + (l - 5)), u = w, l = 1), w = s.get(h, f), w === p ? d++ : (d >= 5 && (c += r.N1 + (d - 5)), p = w, d = 1);
        }
        l >= 5 && (c += r.N1 + (l - 5)), d >= 5 && (c += r.N1 + (d - 5));
      }
      return c;
    }, t.getPenaltyN2 = function(s) {
      const n = s.size;
      let c = 0;
      for (let l = 0; l < n - 1; l++)
        for (let d = 0; d < n - 1; d++) {
          const u = s.get(l, d) + s.get(l, d + 1) + s.get(l + 1, d) + s.get(l + 1, d + 1);
          (u === 4 || u === 0) && c++;
        }
      return c * r.N2;
    }, t.getPenaltyN3 = function(s) {
      const n = s.size;
      let c = 0, l = 0, d = 0;
      for (let u = 0; u < n; u++) {
        l = d = 0;
        for (let p = 0; p < n; p++)
          l = l << 1 & 2047 | s.get(u, p), p >= 10 && (l === 1488 || l === 93) && c++, d = d << 1 & 2047 | s.get(p, u), p >= 10 && (d === 1488 || d === 93) && c++;
      }
      return c * r.N3;
    }, t.getPenaltyN4 = function(s) {
      let n = 0;
      const c = s.data.length;
      for (let d = 0; d < c; d++) n += s.data[d];
      return Math.abs(Math.ceil(n * 100 / c / 5) - 10) * r.N4;
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
      const c = n.size;
      for (let l = 0; l < c; l++)
        for (let d = 0; d < c; d++)
          n.isReserved(d, l) || n.xor(d, l, o(s, d, l));
    }, t.getBestMask = function(s, n) {
      const c = Object.keys(t.Patterns).length;
      let l = 0, d = 1 / 0;
      for (let u = 0; u < c; u++) {
        n(u), t.applyMask(u, s);
        const p = t.getPenaltyN1(s) + t.getPenaltyN2(s) + t.getPenaltyN3(s) + t.getPenaltyN4(s);
        t.applyMask(u, s), p < d && (d = p, l = u);
      }
      return l;
    };
  })(pt)), pt;
}
var Oe = {}, ur;
function cs() {
  if (ur) return Oe;
  ur = 1;
  const t = qt(), r = [
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
  return Oe.getBlocksCount = function(s, n) {
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
  }, Oe.getTotalCodewordsCount = function(s, n) {
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
  }, Oe;
}
var mt = {}, _e = {}, hr;
function _a() {
  if (hr) return _e;
  hr = 1;
  const t = new Uint8Array(512), r = new Uint8Array(256);
  return (function() {
    let a = 1;
    for (let s = 0; s < 255; s++)
      t[s] = a, r[a] = s, a <<= 1, a & 256 && (a ^= 285);
    for (let s = 255; s < 512; s++)
      t[s] = t[s - 255];
  })(), _e.log = function(a) {
    if (a < 1) throw new Error("log(" + a + ")");
    return r[a];
  }, _e.exp = function(a) {
    return t[a];
  }, _e.mul = function(a, s) {
    return a === 0 || s === 0 ? 0 : t[r[a] + r[s]];
  }, _e;
}
var pr;
function Ma() {
  return pr || (pr = 1, (function(t) {
    const r = _a();
    t.mul = function(a, s) {
      const n = new Uint8Array(a.length + s.length - 1);
      for (let c = 0; c < a.length; c++)
        for (let l = 0; l < s.length; l++)
          n[c + l] ^= r.mul(a[c], s[l]);
      return n;
    }, t.mod = function(a, s) {
      let n = new Uint8Array(a);
      for (; n.length - s.length >= 0; ) {
        const c = n[0];
        for (let d = 0; d < s.length; d++)
          n[d] ^= r.mul(s[d], c);
        let l = 0;
        for (; l < n.length && n[l] === 0; ) l++;
        n = n.slice(l);
      }
      return n;
    }, t.generateECPolynomial = function(a) {
      let s = new Uint8Array([1]);
      for (let n = 0; n < a; n++)
        s = t.mul(s, new Uint8Array([1, r.exp(n)]));
      return s;
    };
  })(mt)), mt;
}
var ft, mr;
function Ba() {
  if (mr) return ft;
  mr = 1;
  const t = Ma();
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
    const n = t.mod(s, this.genPoly), c = this.degree - n.length;
    if (c > 0) {
      const l = new Uint8Array(this.degree);
      return l.set(n, c), l;
    }
    return n;
  }, ft = r, ft;
}
var gt = {}, wt = {}, yt = {}, fr;
function ds() {
  return fr || (fr = 1, yt.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), yt;
}
var me = {}, gr;
function us() {
  if (gr) return me;
  gr = 1;
  const t = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let o = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  o = o.replace(/u/g, "\\u");
  const a = "(?:(?![A-Z0-9 $%*+\\-./:]|" + o + `)(?:.|[\r
]))+`;
  me.KANJI = new RegExp(o, "g"), me.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), me.BYTE = new RegExp(a, "g"), me.NUMERIC = new RegExp(t, "g"), me.ALPHANUMERIC = new RegExp(r, "g");
  const s = new RegExp("^" + o + "$"), n = new RegExp("^" + t + "$"), c = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return me.testKanji = function(d) {
    return s.test(d);
  }, me.testNumeric = function(d) {
    return n.test(d);
  }, me.testAlphanumeric = function(d) {
    return c.test(d);
  }, me;
}
var wr;
function Ne() {
  return wr || (wr = 1, (function(t) {
    const r = ds(), o = us();
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
    }, t.getCharCountIndicator = function(n, c) {
      if (!n.ccBits) throw new Error("Invalid mode: " + n);
      if (!r.isValid(c))
        throw new Error("Invalid version: " + c);
      return c >= 1 && c < 10 ? n.ccBits[0] : c < 27 ? n.ccBits[1] : n.ccBits[2];
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
    t.from = function(n, c) {
      if (t.isValid(n))
        return n;
      try {
        return a(n);
      } catch {
        return c;
      }
    };
  })(wt)), wt;
}
var yr;
function Ra() {
  return yr || (yr = 1, (function(t) {
    const r = ke(), o = cs(), a = qt(), s = Ne(), n = ds(), c = 7973, l = r.getBCHDigit(c);
    function d(h, w, g) {
      for (let m = 1; m <= 40; m++)
        if (w <= t.getCapacity(m, g, h))
          return m;
    }
    function u(h, w) {
      return s.getCharCountIndicator(h, w) + 4;
    }
    function p(h, w) {
      let g = 0;
      return h.forEach(function(m) {
        const b = u(m.mode, w);
        g += b + m.getBitsLength();
      }), g;
    }
    function f(h, w) {
      for (let g = 1; g <= 40; g++)
        if (p(h, g) <= t.getCapacity(g, w, s.MIXED))
          return g;
    }
    t.from = function(w, g) {
      return n.isValid(w) ? parseInt(w, 10) : g;
    }, t.getCapacity = function(w, g, m) {
      if (!n.isValid(w))
        throw new Error("Invalid QR Code version");
      typeof m > "u" && (m = s.BYTE);
      const b = r.getSymbolTotalCodewords(w), v = o.getTotalCodewordsCount(w, g), y = (b - v) * 8;
      if (m === s.MIXED) return y;
      const N = y - u(m, w);
      switch (m) {
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
    }, t.getBestVersionForData = function(w, g) {
      let m;
      const b = a.from(g, a.M);
      if (Array.isArray(w)) {
        if (w.length > 1)
          return f(w, b);
        if (w.length === 0)
          return 1;
        m = w[0];
      } else
        m = w;
      return d(m.mode, m.getLength(), b);
    }, t.getEncodedBits = function(w) {
      if (!n.isValid(w) || w < 7)
        throw new Error("Invalid QR Code version");
      let g = w << 12;
      for (; r.getBCHDigit(g) - l >= 0; )
        g ^= c << r.getBCHDigit(g) - l;
      return w << 12 | g;
    };
  })(gt)), gt;
}
var bt = {}, br;
function Da() {
  if (br) return bt;
  br = 1;
  const t = ke(), r = 1335, o = 21522, a = t.getBCHDigit(r);
  return bt.getEncodedBits = function(n, c) {
    const l = n.bit << 3 | c;
    let d = l << 10;
    for (; t.getBCHDigit(d) - a >= 0; )
      d ^= r << t.getBCHDigit(d) - a;
    return (l << 10 | d) ^ o;
  }, bt;
}
var At = {}, vt, Ar;
function Ia() {
  if (Ar) return vt;
  Ar = 1;
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
    let s, n, c;
    for (s = 0; s + 3 <= this.data.length; s += 3)
      n = this.data.substr(s, 3), c = parseInt(n, 10), a.put(c, 10);
    const l = this.data.length - s;
    l > 0 && (n = this.data.substr(s), c = parseInt(n, 10), a.put(c, l * 3 + 1));
  }, vt = r, vt;
}
var kt, vr;
function Ua() {
  if (vr) return kt;
  vr = 1;
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
      let c = r.indexOf(this.data[n]) * 45;
      c += r.indexOf(this.data[n + 1]), s.put(c, 11);
    }
    this.data.length % 2 && s.put(r.indexOf(this.data[n]), 6);
  }, kt = o, kt;
}
var Nt, kr;
function Fa() {
  if (kr) return Nt;
  kr = 1;
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
  }, Nt = r, Nt;
}
var Ct, Nr;
function Wa() {
  if (Nr) return Ct;
  Nr = 1;
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
  }, Ct = o, Ct;
}
var Et = { exports: {} }, Cr;
function Oa() {
  return Cr || (Cr = 1, (function(t) {
    var r = {
      single_source_shortest_paths: function(o, a, s) {
        var n = {}, c = {};
        c[a] = 0;
        var l = r.PriorityQueue.make();
        l.push(a, 0);
        for (var d, u, p, f, h, w, g, m, b; !l.empty(); ) {
          d = l.pop(), u = d.value, f = d.cost, h = o[u] || {};
          for (p in h)
            h.hasOwnProperty(p) && (w = h[p], g = f + w, m = c[p], b = typeof c[p] > "u", (b || m > g) && (c[p] = g, l.push(p, g), n[p] = u));
        }
        if (typeof s < "u" && typeof c[s] > "u") {
          var v = ["Could not find a path from ", a, " to ", s, "."].join("");
          throw new Error(v);
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
  })(Et)), Et.exports;
}
var Er;
function qa() {
  return Er || (Er = 1, (function(t) {
    const r = Ne(), o = Ia(), a = Ua(), s = Fa(), n = Wa(), c = us(), l = ke(), d = Oa();
    function u(v) {
      return unescape(encodeURIComponent(v)).length;
    }
    function p(v, y, N) {
      const E = [];
      let T;
      for (; (T = v.exec(N)) !== null; )
        E.push({
          data: T[0],
          index: T.index,
          mode: y,
          length: T[0].length
        });
      return E;
    }
    function f(v) {
      const y = p(c.NUMERIC, r.NUMERIC, v), N = p(c.ALPHANUMERIC, r.ALPHANUMERIC, v);
      let E, T;
      return l.isKanjiModeEnabled() ? (E = p(c.BYTE, r.BYTE, v), T = p(c.KANJI, r.KANJI, v)) : (E = p(c.BYTE_KANJI, r.BYTE, v), T = []), y.concat(N, E, T).sort(function(S, P) {
        return S.index - P.index;
      }).map(function(S) {
        return {
          data: S.data,
          mode: S.mode,
          length: S.length
        };
      });
    }
    function h(v, y) {
      switch (y) {
        case r.NUMERIC:
          return o.getBitsLength(v);
        case r.ALPHANUMERIC:
          return a.getBitsLength(v);
        case r.KANJI:
          return n.getBitsLength(v);
        case r.BYTE:
          return s.getBitsLength(v);
      }
    }
    function w(v) {
      return v.reduce(function(y, N) {
        const E = y.length - 1 >= 0 ? y[y.length - 1] : null;
        return E && E.mode === N.mode ? (y[y.length - 1].data += N.data, y) : (y.push(N), y);
      }, []);
    }
    function g(v) {
      const y = [];
      for (let N = 0; N < v.length; N++) {
        const E = v[N];
        switch (E.mode) {
          case r.NUMERIC:
            y.push([
              E,
              { data: E.data, mode: r.ALPHANUMERIC, length: E.length },
              { data: E.data, mode: r.BYTE, length: E.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            y.push([
              E,
              { data: E.data, mode: r.BYTE, length: E.length }
            ]);
            break;
          case r.KANJI:
            y.push([
              E,
              { data: E.data, mode: r.BYTE, length: u(E.data) }
            ]);
            break;
          case r.BYTE:
            y.push([
              { data: E.data, mode: r.BYTE, length: u(E.data) }
            ]);
        }
      }
      return y;
    }
    function m(v, y) {
      const N = {}, E = { start: {} };
      let T = ["start"];
      for (let A = 0; A < v.length; A++) {
        const S = v[A], P = [];
        for (let x = 0; x < S.length; x++) {
          const M = S[x], _ = "" + A + x;
          P.push(_), N[_] = { node: M, lastCount: 0 }, E[_] = {};
          for (let L = 0; L < T.length; L++) {
            const B = T[L];
            N[B] && N[B].node.mode === M.mode ? (E[B][_] = h(N[B].lastCount + M.length, M.mode) - h(N[B].lastCount, M.mode), N[B].lastCount += M.length) : (N[B] && (N[B].lastCount = M.length), E[B][_] = h(M.length, M.mode) + 4 + r.getCharCountIndicator(M.mode, y));
          }
        }
        T = P;
      }
      for (let A = 0; A < T.length; A++)
        E[T[A]].end = 0;
      return { map: E, table: N };
    }
    function b(v, y) {
      let N;
      const E = r.getBestModeForData(v);
      if (N = r.from(y, E), N !== r.BYTE && N.bit < E.bit)
        throw new Error('"' + v + '" cannot be encoded with mode ' + r.toString(N) + `.
 Suggested mode is: ` + r.toString(E));
      switch (N === r.KANJI && !l.isKanjiModeEnabled() && (N = r.BYTE), N) {
        case r.NUMERIC:
          return new o(v);
        case r.ALPHANUMERIC:
          return new a(v);
        case r.KANJI:
          return new n(v);
        case r.BYTE:
          return new s(v);
      }
    }
    t.fromArray = function(y) {
      return y.reduce(function(N, E) {
        return typeof E == "string" ? N.push(b(E, null)) : E.data && N.push(b(E.data, E.mode)), N;
      }, []);
    }, t.fromString = function(y, N) {
      const E = f(y, l.isKanjiModeEnabled()), T = g(E), A = m(T, N), S = d.find_path(A.map, "start", "end"), P = [];
      for (let x = 1; x < S.length - 1; x++)
        P.push(A.table[S[x]].node);
      return t.fromArray(w(P));
    }, t.rawSplit = function(y) {
      return t.fromArray(
        f(y, l.isKanjiModeEnabled())
      );
    };
  })(At)), At;
}
var Sr;
function ja() {
  if (Sr) return it;
  Sr = 1;
  const t = ke(), r = qt(), o = Sa(), a = xa(), s = Pa(), n = Ta(), c = La(), l = cs(), d = Ba(), u = Ra(), p = Da(), f = Ne(), h = qa();
  function w(A, S) {
    const P = A.size, x = n.getPositions(S);
    for (let M = 0; M < x.length; M++) {
      const _ = x[M][0], L = x[M][1];
      for (let B = -1; B <= 7; B++)
        if (!(_ + B <= -1 || P <= _ + B))
          for (let R = -1; R <= 7; R++)
            L + R <= -1 || P <= L + R || (B >= 0 && B <= 6 && (R === 0 || R === 6) || R >= 0 && R <= 6 && (B === 0 || B === 6) || B >= 2 && B <= 4 && R >= 2 && R <= 4 ? A.set(_ + B, L + R, !0, !0) : A.set(_ + B, L + R, !1, !0));
    }
  }
  function g(A) {
    const S = A.size;
    for (let P = 8; P < S - 8; P++) {
      const x = P % 2 === 0;
      A.set(P, 6, x, !0), A.set(6, P, x, !0);
    }
  }
  function m(A, S) {
    const P = s.getPositions(S);
    for (let x = 0; x < P.length; x++) {
      const M = P[x][0], _ = P[x][1];
      for (let L = -2; L <= 2; L++)
        for (let B = -2; B <= 2; B++)
          L === -2 || L === 2 || B === -2 || B === 2 || L === 0 && B === 0 ? A.set(M + L, _ + B, !0, !0) : A.set(M + L, _ + B, !1, !0);
    }
  }
  function b(A, S) {
    const P = A.size, x = u.getEncodedBits(S);
    let M, _, L;
    for (let B = 0; B < 18; B++)
      M = Math.floor(B / 3), _ = B % 3 + P - 8 - 3, L = (x >> B & 1) === 1, A.set(M, _, L, !0), A.set(_, M, L, !0);
  }
  function v(A, S, P) {
    const x = A.size, M = p.getEncodedBits(S, P);
    let _, L;
    for (_ = 0; _ < 15; _++)
      L = (M >> _ & 1) === 1, _ < 6 ? A.set(_, 8, L, !0) : _ < 8 ? A.set(_ + 1, 8, L, !0) : A.set(x - 15 + _, 8, L, !0), _ < 8 ? A.set(8, x - _ - 1, L, !0) : _ < 9 ? A.set(8, 15 - _ - 1 + 1, L, !0) : A.set(8, 15 - _ - 1, L, !0);
    A.set(x - 8, 8, 1, !0);
  }
  function y(A, S) {
    const P = A.size;
    let x = -1, M = P - 1, _ = 7, L = 0;
    for (let B = P - 1; B > 0; B -= 2)
      for (B === 6 && B--; ; ) {
        for (let R = 0; R < 2; R++)
          if (!A.isReserved(M, B - R)) {
            let I = !1;
            L < S.length && (I = (S[L] >>> _ & 1) === 1), A.set(M, B - R, I), _--, _ === -1 && (L++, _ = 7);
          }
        if (M += x, M < 0 || P <= M) {
          M -= x, x = -x;
          break;
        }
      }
  }
  function N(A, S, P) {
    const x = new o();
    P.forEach(function(R) {
      x.put(R.mode.bit, 4), x.put(R.getLength(), f.getCharCountIndicator(R.mode, A)), R.write(x);
    });
    const M = t.getSymbolTotalCodewords(A), _ = l.getTotalCodewordsCount(A, S), L = (M - _) * 8;
    for (x.getLengthInBits() + 4 <= L && x.put(0, 4); x.getLengthInBits() % 8 !== 0; )
      x.putBit(0);
    const B = (L - x.getLengthInBits()) / 8;
    for (let R = 0; R < B; R++)
      x.put(R % 2 ? 17 : 236, 8);
    return E(x, A, S);
  }
  function E(A, S, P) {
    const x = t.getSymbolTotalCodewords(S), M = l.getTotalCodewordsCount(S, P), _ = x - M, L = l.getBlocksCount(S, P), B = x % L, R = L - B, I = Math.floor(x / L), Z = Math.floor(_ / L), he = Z + 1, te = I - Z, H = new d(te);
    let D = 0;
    const U = new Array(L), Q = new Array(L);
    let re = 0;
    const oe = new Uint8Array(A.buffer);
    for (let G = 0; G < L; G++) {
      const ce = G < R ? Z : he;
      U[G] = oe.slice(D, D + ce), Q[G] = H.encode(U[G]), D += ce, re = Math.max(re, ce);
    }
    const fe = new Uint8Array(x);
    let pe = 0, z, j;
    for (z = 0; z < re; z++)
      for (j = 0; j < L; j++)
        z < U[j].length && (fe[pe++] = U[j][z]);
    for (z = 0; z < te; z++)
      for (j = 0; j < L; j++)
        fe[pe++] = Q[j][z];
    return fe;
  }
  function T(A, S, P, x) {
    let M;
    if (Array.isArray(A))
      M = h.fromArray(A);
    else if (typeof A == "string") {
      let I = S;
      if (!I) {
        const Z = h.rawSplit(A);
        I = u.getBestVersionForData(Z, P);
      }
      M = h.fromString(A, I || 40);
    } else
      throw new Error("Invalid data");
    const _ = u.getBestVersionForData(M, P);
    if (!_)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!S)
      S = _;
    else if (S < _)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + _ + `.
`
      );
    const L = N(S, P, M), B = t.getSymbolSize(S), R = new a(B);
    return w(R, S), g(R), m(R, S), v(R, P, 0), S >= 7 && b(R, S), y(R, L), isNaN(x) && (x = c.getBestMask(
      R,
      v.bind(null, R, P)
    )), c.applyMask(x, R), v(R, P, x), {
      modules: R,
      version: S,
      errorCorrectionLevel: P,
      maskPattern: x,
      segments: M
    };
  }
  return it.create = function(S, P) {
    if (typeof S > "u" || S === "")
      throw new Error("No input text");
    let x = r.M, M, _;
    return typeof P < "u" && (x = r.from(P.errorCorrectionLevel, r.M), M = u.from(P.version), _ = c.from(P.maskPattern), P.toSJISFunc && t.setToSJISFunction(P.toSJISFunc)), T(S, M, x, _);
  }, it;
}
var St = {}, xt = {}, xr;
function hs() {
  return xr || (xr = 1, (function(t) {
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
      const s = typeof a.margin > "u" || a.margin === null || a.margin < 0 ? 4 : a.margin, n = a.width && a.width >= 21 ? a.width : void 0, c = a.scale || 4;
      return {
        width: n,
        scale: n ? 4 : c,
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
      const c = s.modules.size, l = s.modules.data, d = t.getScale(c, n), u = Math.floor((c + n.margin * 2) * d), p = n.margin * d, f = [n.color.light, n.color.dark];
      for (let h = 0; h < u; h++)
        for (let w = 0; w < u; w++) {
          let g = (h * u + w) * 4, m = n.color.light;
          if (h >= p && w >= p && h < u - p && w < u - p) {
            const b = Math.floor((h - p) / d), v = Math.floor((w - p) / d);
            m = f[l[b * c + v] ? 1 : 0];
          }
          a[g++] = m.r, a[g++] = m.g, a[g++] = m.b, a[g] = m.a;
        }
    };
  })(xt)), xt;
}
var Pr;
function za() {
  return Pr || (Pr = 1, (function(t) {
    const r = hs();
    function o(s, n, c) {
      s.clearRect(0, 0, n.width, n.height), n.style || (n.style = {}), n.height = c, n.width = c, n.style.height = c + "px", n.style.width = c + "px";
    }
    function a() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    t.render = function(n, c, l) {
      let d = l, u = c;
      typeof d > "u" && (!c || !c.getContext) && (d = c, c = void 0), c || (u = a()), d = r.getOptions(d);
      const p = r.getImageWidth(n.modules.size, d), f = u.getContext("2d"), h = f.createImageData(p, p);
      return r.qrToImageData(h.data, n, d), o(f, u, p), f.putImageData(h, 0, 0), u;
    }, t.renderToDataURL = function(n, c, l) {
      let d = l;
      typeof d > "u" && (!c || !c.getContext) && (d = c, c = void 0), d || (d = {});
      const u = t.render(n, c, d), p = d.type || "image/png", f = d.rendererOpts || {};
      return u.toDataURL(p, f.quality);
    };
  })(St)), St;
}
var Pt = {}, Tr;
function Va() {
  if (Tr) return Pt;
  Tr = 1;
  const t = hs();
  function r(s, n) {
    const c = s.a / 255, l = n + '="' + s.hex + '"';
    return c < 1 ? l + " " + n + '-opacity="' + c.toFixed(2).slice(1) + '"' : l;
  }
  function o(s, n, c) {
    let l = s + n;
    return typeof c < "u" && (l += " " + c), l;
  }
  function a(s, n, c) {
    let l = "", d = 0, u = !1, p = 0;
    for (let f = 0; f < s.length; f++) {
      const h = Math.floor(f % n), w = Math.floor(f / n);
      !h && !u && (u = !0), s[f] ? (p++, f > 0 && h > 0 && s[f - 1] || (l += u ? o("M", h + c, 0.5 + w + c) : o("m", d, 0), d = 0, u = !1), h + 1 < n && s[f + 1] || (l += o("h", p), p = 0)) : d++;
    }
    return l;
  }
  return Pt.render = function(n, c, l) {
    const d = t.getOptions(c), u = n.modules.size, p = n.modules.data, f = u + d.margin * 2, h = d.color.light.a ? "<path " + r(d.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", w = "<path " + r(d.color.dark, "stroke") + ' d="' + a(p, u, d.margin) + '"/>', g = 'viewBox="0 0 ' + f + " " + f + '"', b = '<svg xmlns="http://www.w3.org/2000/svg" ' + (d.width ? 'width="' + d.width + '" height="' + d.width + '" ' : "") + g + ' shape-rendering="crispEdges">' + h + w + `</svg>
`;
    return typeof l == "function" && l(null, b), b;
  }, Pt;
}
var Lr;
function Ha() {
  if (Lr) return Ee;
  Lr = 1;
  const t = Ea(), r = ja(), o = za(), a = Va();
  function s(n, c, l, d, u) {
    const p = [].slice.call(arguments, 1), f = p.length, h = typeof p[f - 1] == "function";
    if (!h && !t())
      throw new Error("Callback required as last argument");
    if (h) {
      if (f < 2)
        throw new Error("Too few arguments provided");
      f === 2 ? (u = l, l = c, c = d = void 0) : f === 3 && (c.getContext && typeof u > "u" ? (u = d, d = void 0) : (u = d, d = l, l = c, c = void 0));
    } else {
      if (f < 1)
        throw new Error("Too few arguments provided");
      return f === 1 ? (l = c, c = d = void 0) : f === 2 && !c.getContext && (d = l, l = c, c = void 0), new Promise(function(w, g) {
        try {
          const m = r.create(l, d);
          w(n(m, c, d));
        } catch (m) {
          g(m);
        }
      });
    }
    try {
      const w = r.create(l, d);
      u(null, n(w, c, d));
    } catch (w) {
      u(w);
    }
  }
  return Ee.create = r.create, Ee.toCanvas = s.bind(null, o.render), Ee.toDataURL = s.bind(null, o.renderToDataURL), Ee.toString = s.bind(null, function(n, c, l) {
    return a.render(n, l);
  }), Ee;
}
var Qa = Ha();
const Ya = /* @__PURE__ */ Po(Qa);
function Ka({ value: t, size: r = 200, alt: o = "QR code", className: a = "" }) {
  const s = $(null), [n, c] = k(null);
  return F(() => {
    !s.current || !t || Ya.toCanvas(s.current, t, {
      width: r,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      c(null);
    }).catch((l) => {
      c(l instanceof Error ? l.message : "Failed to generate QR code");
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
function ps() {
  const { config: t, _internal: r } = ne(), [o, a] = k(null), [s, n] = k("idle"), [c, l] = k(null), [d, u] = k(!1), [p, f] = k(null), h = O(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), w = C(async () => {
    u(!0), f(null);
    try {
      const E = await h.get("/mfa/status");
      return a(E), E;
    } catch (E) {
      const T = q(E, "Failed to get TOTP status");
      throw f(T), T;
    } finally {
      u(!1);
    }
  }, [h]), g = C(async () => {
    u(!0), f(null), n("loading");
    try {
      const E = await h.post("/mfa/setup", {});
      return l(E), n("setup"), E;
    } catch (E) {
      const T = q(E, "Failed to start TOTP setup");
      throw f(T), n("error"), T;
    } finally {
      u(!1);
    }
  }, [h]), m = C(
    async (E) => {
      if (!/^\d{6}$/.test(E)) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(T), T;
      }
      u(!0), f(null), n("verifying");
      try {
        await h.post("/mfa/enable", { code: E }), n("success");
        try {
          const T = await h.get("/mfa/status");
          a(T);
        } catch {
          a({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (T) {
        const A = q(T, "Invalid verification code");
        throw f(A), n("error"), A;
      } finally {
        u(!1);
      }
    },
    [h]
  ), b = C(
    async (E) => {
      if (!E) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw f(T), T;
      }
      u(!0), f(null);
      try {
        await h.post("/mfa/disable", { password: E }), a({ enabled: !1, recoveryCodesRemaining: 0 }), l(null), n("idle");
      } catch (T) {
        const A = q(T, "Failed to disable TOTP");
        throw f(A), A;
      } finally {
        u(!1);
      }
    },
    [h]
  ), v = C(
    async (E) => {
      if (!/^\d{6}$/.test(E)) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(T), T;
      }
      u(!0), f(null);
      try {
        return await h.post(
          "/mfa/recovery-codes/regenerate",
          { code: E }
        );
      } catch (T) {
        const A = q(T, "Failed to regenerate recovery codes");
        throw f(A), A;
      } finally {
        u(!1);
      }
    },
    [h]
  ), y = C(() => f(null), []), N = C(() => {
    f(null), l(null), n("idle"), u(!1);
  }, []);
  return {
    status: o,
    setupState: s,
    setupData: c,
    isLoading: d,
    error: p,
    getStatus: w,
    beginSetup: g,
    enableTotp: m,
    disableTotp: b,
    regenerateBackupCodes: v,
    clearError: y,
    reset: N
  };
}
function Ga({ onSuccess: t, onCancel: r, className: o = "" }) {
  const { setupState: a, setupData: s, isLoading: n, error: c, beginSetup: l, enableTotp: d, clearError: u, reset: p } = ps(), [f, h] = k("qr"), [w, g] = k(""), [m, b] = k(!1), [v, y] = k(!1), N = $(null);
  F(() => {
    a === "idle" && l().catch(() => {
    });
  }, [a, l]), F(() => {
    a === "success" && t?.();
  }, [a, t]);
  const E = async () => {
    s?.secret && (await navigator.clipboard.writeText(s.secret), b(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => b(!1), 2e3));
  }, T = async () => {
    if (s?.recoveryCodes) {
      const P = s.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(P);
    }
  }, A = async () => {
    try {
      await d(w);
    } catch {
      g("");
    }
  }, S = () => {
    p(), r?.();
  };
  return F(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), a === "loading" || a === "idle" && n ? /* @__PURE__ */ e("div", { className: `cedros-totp-setup ${o}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(K, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : a === "error" && !s ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${o}`, children: [
    /* @__PURE__ */ e(ee, { error: c, onDismiss: u }),
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
          onClick: () => l(),
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
      /* @__PURE__ */ e("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ e(Ka, { value: s.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
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
              children: m ? "Copied!" : "Copy"
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
            onClick: () => h("backup"),
            children: "Continue"
          }
        )
      ] })
    ] }),
    f === "backup" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: s.recoveryCodes.map((P, x) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: P }, x)) }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: T,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ i("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: v,
            onChange: (P) => y(P.target.checked)
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
            disabled: !v,
            children: "Continue"
          }
        )
      ] })
    ] }),
    f === "verify" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ e(
        Vr,
        {
          value: w,
          onChange: g,
          onComplete: A,
          disabled: n,
          error: c?.message,
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
            children: n ? /* @__PURE__ */ i(X, { children: [
              /* @__PURE__ */ e(K, { size: "sm" }),
              /* @__PURE__ */ e("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function kl({ onStatusChange: t, className: r = "" }) {
  const { status: o, isLoading: a, error: s, getStatus: n, disableTotp: c, regenerateBackupCodes: l, clearError: d } = ps(), [u, p] = k("status"), [f, h] = k(""), [w, g] = k(""), [m, b] = k(null), [v, y] = k(!1), [N, E] = k(null);
  F(() => {
    n().catch(() => {
    });
  }, [n]);
  const T = C(() => {
    p("status"), t?.(!0);
  }, [t]), A = async () => {
    y(!0), E(null);
    try {
      await c(f), p("status"), h(""), t?.(!1);
    } catch (x) {
      E(x instanceof Error ? x.message : "Failed to disable 2FA"), h("");
    } finally {
      y(!1);
    }
  }, S = async () => {
    y(!0), E(null);
    try {
      const x = await l(w);
      b(x.recoveryCodes), g("");
    } catch (x) {
      E(x instanceof Error ? x.message : "Failed to regenerate codes"), g("");
    } finally {
      y(!1);
    }
  }, P = async () => {
    m && await navigator.clipboard.writeText(m.join(`
`));
  };
  return a && !o ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(K, { size: "md", label: "Loading security settings" }) }) }) : s && !o ? /* @__PURE__ */ i("div", { className: `cedros-totp-settings ${r}`, children: [
    /* @__PURE__ */ e(ee, { error: s, onDismiss: d }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => n(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e(Ga, { onSuccess: T, onCancel: () => p("status") }) }) : u === "disable" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    N && /* @__PURE__ */ e("div", { className: "cedros-totp-error", children: /* @__PURE__ */ e(
      ee,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => E(null)
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ e(
      we,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: f,
        onChange: (x) => h(x.target.value),
        disabled: v,
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
            p("status"), h(""), E(null);
          },
          disabled: v,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: A,
          disabled: v || f.length === 0,
          children: v ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(K, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? m ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: m.map((x, M) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: x }, M)) }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: P,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ e("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          p("status"), b(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    N && /* @__PURE__ */ e("div", { className: "cedros-totp-error", children: /* @__PURE__ */ e(
      ee,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => E(null)
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ e(
      Vr,
      {
        value: w,
        onChange: g,
        onComplete: S,
        disabled: v,
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
            p("status"), g(""), E(null);
          },
          disabled: v,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: S,
          disabled: v || w.length !== 6,
          children: v ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(K, { size: "sm" }),
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
class $a {
  client;
  constructor(r, o, a, s) {
    this.client = new ue({ baseUrl: r, timeoutMs: o, retryAttempts: a, getAccessToken: s });
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
      throw q(o, "Failed to change password");
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
      throw q(o, "Failed to update profile");
    }
  }
}
function Ja() {
  const { config: t, authState: r, _internal: o } = ne(), [a, s] = k(!1), [n, c] = k(null), l = O(
    () => new $a(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), d = C(() => {
    c(null);
  }, []), u = C(
    async (f) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      s(!0), c(null);
      try {
        return await l.updateProfile(f);
      } catch (h) {
        const w = h instanceof Error ? h : new Error("Failed to update profile");
        throw c(w), w;
      } finally {
        s(!1);
      }
    },
    [r, l]
  ), p = C(
    async (f) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to change password");
      s(!0), c(null);
      try {
        await l.changePassword(f);
      } catch (h) {
        const w = h instanceof Error ? h : new Error("Failed to change password");
        throw c(w), w;
      } finally {
        s(!1);
      }
    },
    [r, l]
  );
  return {
    isLoading: a,
    error: n,
    updateProfile: u,
    changePassword: p,
    clearError: d
  };
}
function Nl({
  onPasswordChange: t,
  onClose: r,
  className: o = ""
}) {
  const { user: a } = Br(), { isLoading: s, error: n, changePassword: c, clearError: l } = Ja(), [d, u] = k("main"), [p, f] = k(""), [h, w] = k(""), [g, m] = k(""), [b, v] = k(null), [y, N] = k(null), E = Ut(h), T = h === g, A = p.length > 0 && h.length > 0 && g.length > 0 && E.isValid && T, S = C(async () => {
    if (A) {
      v(null), N(null);
      try {
        await c({
          currentPassword: p,
          newPassword: h
        }), f(""), w(""), m(""), N("Password changed successfully. Other sessions have been logged out."), t?.(), setTimeout(() => {
          u("main"), N(null);
        }, 2e3);
      } catch (M) {
        v(M instanceof Error ? M.message : "Failed to change password");
      }
    }
  }, [A, p, h, c, t]), P = C(() => {
    u("main"), f(""), w(""), m(""), v(null), l();
  }, [l]), x = () => a?.name ? a.name.split(" ").map((M) => M[0]).join("").toUpperCase().slice(0, 2) : a?.email ? a.email[0].toUpperCase() : "?";
  return d === "change-password" ? /* @__PURE__ */ e("div", { className: `cedros-profile-settings ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ e("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (b || n) && /* @__PURE__ */ e("div", { className: "cedros-profile-error", children: /* @__PURE__ */ e(
      ee,
      {
        error: { code: "UNKNOWN_ERROR", message: b || n?.message || "" },
        onDismiss: () => {
          v(null), l();
        }
      }
    ) }),
    y && /* @__PURE__ */ i("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ e("span", { className: "cedros-profile-success-icon", children: "✓" }),
      y
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        we,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: p,
          onChange: (M) => f(M.target.value),
          disabled: s,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        we,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: h,
          onChange: (M) => w(M.target.value),
          disabled: s,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        we,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: g,
          onChange: (M) => m(M.target.value),
          disabled: s,
          error: g.length > 0 && !T ? "Passwords do not match" : void 0
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
          children: s ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(K, { size: "sm" }),
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
      ) : /* @__PURE__ */ e("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: x() }) }),
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
function Xa() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), n = O(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), c = C(() => {
    s(null);
  }, []), l = C(
    async (g) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(g) || g <= 0) {
        const m = new Error(
          `Invalid deposit amount: ${g}. Must be a positive integer (lamports).`
        );
        throw s(m.message), m;
      }
      o(!0), s(null);
      try {
        return await n.post("/deposit", {
          amount_lamports: g
        });
      } catch (m) {
        const b = q(m, "Failed to execute deposit");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [n]
  ), d = C(
    async (g) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.get(`/deposit/status/${encodeURIComponent(g)}`);
      } catch (m) {
        const b = q(m, "Failed to get deposit status");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [n]
  ), u = C(async () => {
    if (!n)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return await n.get("/deposit/config");
    } catch (g) {
      const m = q(g, "Failed to get deposit config");
      throw s(m.message), m;
    } finally {
      o(!1);
    }
  }, [n]), p = C(
    async (g) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const m = new URLSearchParams();
        g?.limit !== void 0 && m.set("limit", String(g.limit)), g?.offset !== void 0 && m.set("offset", String(g.offset));
        const b = m.toString(), v = b ? `/deposits?${b}` : "/deposits";
        return await n.get(v);
      } catch (m) {
        const b = q(m, "Failed to list deposits");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [n]
  ), f = C(
    async (g) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const m = new URLSearchParams({
          input_mint: g.inputMint,
          amount: String(g.amount),
          taker: g.taker
        });
        return await n.get(`/deposit/quote?${m}`);
      } catch (m) {
        const b = q(m, "Failed to get deposit quote");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [n]
  ), h = C(
    async (g) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.post("/deposit/public", g);
      } catch (m) {
        const b = q(m, "Failed to execute public deposit");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [n]
  ), w = C(
    async (g) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.post("/deposit/micro", g);
      } catch (m) {
        const b = q(m, "Failed to execute micro deposit");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [n]
  );
  return {
    deposit: l,
    getQuote: f,
    publicDeposit: h,
    microDeposit: w,
    getStatus: d,
    getConfig: u,
    listDeposits: p,
    isLoading: r,
    error: a,
    clearError: c
  };
}
function ms({
  tokens: t,
  selectedToken: r,
  onSelect: o,
  openSignal: a,
  placeholder: s = "Select token",
  disabled: n = !1,
  className: c = "",
  searchable: l = !0
}) {
  const [d, u] = k(!1), [p, f] = k(""), h = $(null), w = $(null), g = O(() => {
    if (!p.trim()) return t;
    const y = p.toLowerCase();
    return t.filter(
      (N) => N.symbol.toLowerCase().includes(y) || N.name.toLowerCase().includes(y) || N.mint.toLowerCase().includes(y)
    );
  }, [t, p]);
  F(() => {
    const y = (N) => {
      h.current && !h.current.contains(N.target) && (u(!1), f(""));
    };
    if (d)
      return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
  }, [d]), F(() => {
    d && l && w.current && w.current.focus();
  }, [d, l]), F(() => {
    a === void 0 || n || (u(!0), f(""));
  }, [a, n]);
  const m = C(() => {
    n || (u((y) => !y), d && f(""));
  }, [n, d]), b = C(
    (y) => {
      o(y), u(!1), f("");
    },
    [o]
  ), v = C(
    (y) => {
      y.key === "Escape" ? (u(!1), f("")) : y.key === "Enter" && g.length === 1 && b(g[0]);
    },
    [g, b]
  );
  return /* @__PURE__ */ i(
    "div",
    {
      ref: h,
      className: `cedros-token-selector ${d ? "cedros-token-selector-open" : ""} ${n ? "cedros-token-selector-disabled" : ""} ${c}`,
      onKeyDown: v,
      children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: m,
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
                    onError: (y) => {
                      y.target.style.display = "none";
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
          l && /* @__PURE__ */ e("div", { className: "cedros-token-search", children: /* @__PURE__ */ e(
            "input",
            {
              ref: w,
              type: "text",
              value: p,
              onChange: (y) => f(y.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-token-list", children: g.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ e(X, { children: g.map((y) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${r?.mint === y.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => b(y),
              role: "option",
              "aria-selected": r?.mint === y.mint,
              children: [
                y.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    src: y.logoUrl,
                    alt: y.symbol,
                    className: "cedros-token-icon",
                    onError: (N) => {
                      N.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ i("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-token-symbol", children: y.symbol }),
                  /* @__PURE__ */ e("span", { className: "cedros-token-name", children: y.name })
                ] }),
                r?.mint === y.mint && /* @__PURE__ */ e("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            y.mint
          )) }) })
        ] })
      ]
    }
  );
}
function jt(t, r) {
  return r.privateDepositsEnabled && t >= r.privateMinUsd ? "private" : t >= r.publicMinUsd ? "public" : "sol_micro";
}
const zt = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Za = 1e4, Je = 1e3, fs = 3;
function ei(t) {
  return Number.isFinite(t) ? `$${Math.round(t)}` : "$0";
}
function ti(t, r) {
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
        detail: `SOL only under ${ei(r.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function Vt(t, r, o) {
  return Math.min(Math.max(t, r), o);
}
function ri(t, r) {
  if (r <= 0) return 0;
  const o = Vt(t / r, 0, 1);
  return Math.round(Math.pow(o, 1 / fs) * Je);
}
function si(t, r) {
  const o = Vt(t / Je, 0, 1);
  return r * Math.pow(o, fs);
}
function gs(t) {
  return t < 10 ? 0.01 : t < 100 ? 1 : t < 500 ? 5 : t < 1e3 ? 10 : t < 5e3 ? 25 : 50;
}
function oi(t) {
  return t < 1 ? 2 : 0;
}
function _r(t) {
  const r = gs(t), o = Math.round(t / r) * r, a = oi(r);
  return Number(o.toFixed(a));
}
function ws({
  config: t,
  valueUsd: r,
  onChange: o,
  maxUsd: a = Za,
  disabled: s = !1,
  className: n = ""
}) {
  const c = Vt(Number.isFinite(r) ? r : 0, 0, a), l = O(() => jt(c, t), [c, t]), d = ti(l, t), u = ri(c, a), p = u / Je * 100;
  return /* @__PURE__ */ i("div", { className: `cedros-tiered-slider ${n}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ e("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            value: c || "",
            onChange: (f) => o(_r(parseFloat(f.target.value) || 0)),
            placeholder: "Enter amount",
            disabled: s,
            min: 0,
            step: gs(c),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ i("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${l}`, children: [
          l === "sol_micro" && /* @__PURE__ */ e("img", { src: zt, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        max: Je,
        step: 1,
        value: u,
        onChange: (f) => o(_r(si(parseFloat(f.target.value), a))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${p}%, var(--cedros-border) ${p}%, var(--cedros-border) 100%)`
        },
        disabled: s,
        "aria-label": "Deposit amount slider"
      }
    ),
    d.note && /* @__PURE__ */ e("div", { className: "cedros-tiered-slider-note", children: d.note })
  ] });
}
function ni(t) {
  return t.companyFeePercent > 0 || t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap" || t.feePolicy === "user_pays_privacy";
}
function ai(t, r, o) {
  const { feePolicy: a, privacyFeePercent: s, swapFeePercent: n, companyFeePercent: c } = t;
  let l = c;
  return o || (a === "user_pays_all" ? (l += n, r && (l += s)) : a === "user_pays_privacy" && r ? l += s : a === "user_pays_swap" && (l += n)), l;
}
const je = 1e9, Se = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: zt
}, xe = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, ys = 1e4;
function ii(t, r) {
  const o = r < t.publicMinUsd, a = r >= t.privateMinUsd, s = [], n = !o && a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0), c = !o && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0), l = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  if (n) {
    const d = t.privacyFeeFixedLamports / je, u = t.privacyFeePercent, p = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Privacy", solAmount: d, percent: u, usdAmount: p + f });
  }
  if (c) {
    const d = t.swapFeeFixedLamports / je, u = t.swapFeePercent, p = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Swap", solAmount: d, percent: u, usdAmount: p + f });
  }
  if (l) {
    const d = t.companyFeeFixedLamports / je, u = t.companyFeePercent, p = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Service", solAmount: d, percent: u, usdAmount: p + f });
  }
  return s;
}
function bs(t, r, o) {
  const a = ii(t, r), s = o < 0.01 ? 0.01 : o;
  if (a.length === 0)
    return `Total: $${s.toFixed(2)}`;
  const n = a.reduce((g, m) => g + m.solAmount, 0), c = a.reduce((g, m) => g + m.percent, 0), l = { fee: 7, sol: 8, rate: 7, usd: 8 }, d = (g) => {
    const m = g.label.padEnd(l.fee), b = g.solAmount.toFixed(4).padStart(6).padEnd(l.sol), v = (g.percent.toFixed(2) + "%").padStart(5).padEnd(l.rate), y = ("$" + Math.max(g.usdAmount, 0.01).toFixed(2)).padEnd(l.usd);
    return `${m} │ ${b} │ ${v} │ ${y}`;
  }, u = `${"Fee".padEnd(l.fee)} │ ${"SOL".padEnd(l.sol)} │ ${"+ Rate".padEnd(l.rate)} │ ${"= Total".padEnd(l.usd)}`, p = `${"─".repeat(l.fee)}─┼─${"─".repeat(l.sol)}─┼─${"─".repeat(l.rate)}─┼─${"─".repeat(l.usd)}`, f = ("$" + s.toFixed(2)).padEnd(l.usd), h = `${"TOTAL".padEnd(l.fee)} │ ${n.toFixed(4).padStart(6).padEnd(l.sol)} │ ${(c.toFixed(2) + "%").padStart(5).padEnd(l.rate)} │ ${f}`;
  return [u, p, ...a.map(d), p, h].join(`
`);
}
function li(t) {
  const r = [], o = t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0, a = t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0, s = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  return o && r.push("Privacy Cash fee"), a && r.push("swap fee"), s && r.push("company service fee"), r.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Ze(t, r) {
  if (r <= 0) return 0;
  const o = r < t.publicMinUsd, a = r >= t.privateMinUsd, s = ai(t, a, o);
  let n = t.companyFeeFixedLamports;
  o || (a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (n += t.privacyFeeFixedLamports), (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (n += t.swapFeeFixedLamports));
  const c = n / je * t.solPriceUsd, l = r * (s / 100);
  return c + l;
}
function As(t, r, o) {
  return t === "sol" ? "SOL" : t === "single-token" ? r.symbol : o.some((s) => s.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function Mr(t) {
  return t.map((r) => r.trim()).filter(Boolean);
}
const vs = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function ks(t, r, o) {
  if (vs.has(t.symbol)) return 1;
  const a = r.tokenPrices?.[t.symbol];
  if (a && a > 0) return a;
  if (t.symbol === "SOL") return r.solPriceUsd || null;
  const s = o?.[t.symbol];
  return s && s > 0 ? s : null;
}
function Ns(t, r) {
  const o = vs.has(r) ? 2 : 4;
  return t.toFixed(o);
}
function Cl({
  config: t,
  currencyMode: r,
  depositMethod: o,
  tokens: a = [],
  defaultToken: s,
  minAmount: n,
  maxAmount: c = 1e4,
  onSuccess: l,
  onError: d,
  onCancel: u,
  onUnlockRequired: p,
  onAuthorize: f,
  className: h = "",
  showStepIndicator: w = !0,
  pollInterval: g = 5e3,
  demoMode: m = !1,
  demoAutoConfirmMs: b,
  tokenPriceUsd: v,
  showExplainer: y = !1,
  siteName: N,
  explainerConfig: E
}) {
  const { deposit: T, getStatus: A, error: S, clearError: P } = Xa(), x = Xe(), M = Mr(t.quickActionTokens), _ = Mr(t.customTokenSymbols), L = O(() => {
    const W = t.customTokens ?? [];
    if (W.length === 0) return a;
    const V = new Set(a.map((J) => J.symbol)), Y = [...a];
    for (const J of W)
      V.has(J.symbol) || (Y.push({
        mint: J.mint,
        symbol: J.symbol,
        name: J.symbol,
        // Use symbol as name for custom tokens
        decimals: J.decimals,
        logoUrl: J.logoUrl
      }), V.add(J.symbol));
    return Y;
  }, [a, t.customTokens]), B = O(() => {
    if (_.length === 0) return L;
    const W = L.filter((V) => _.includes(V.symbol));
    return W.length > 0 ? W : L;
  }, [L, _]), R = t.privateDepositsEnabled, I = o ? o === "sign" && !R ? "receive" : o : R && x.hasExternalWallet ? "sign" : "receive", Z = M[0] ? L.find((W) => W.symbol === M[0]) : void 0, he = r === "sol" ? Se : r === "single-token" ? Z ?? L.find((W) => W.symbol === "USDC") ?? L[0] ?? Se : s ?? Z ?? L.find((W) => W.symbol === "USDC") ?? L.find((W) => W.symbol !== "SOL") ?? L[0] ?? Se, te = C(() => y ? "explainer" : "unlock", [y]), [H, D] = k(te), [U, Q] = k(he), [re, oe] = k(""), [fe, pe] = k(null), [z, j] = k(null), [G, ce] = k(null), [be, Qt] = k(null), [et, Te] = k(!1), [xs, tt] = k(!1), [Be, Yt] = k(null);
  F(() => {
    D(te()), Q(he), oe(""), pe(null), j(null), ce(null), Qt(null), Te(!1), tt(!1), Yt(null), P();
  }, [r, I, he, P, te]);
  const Ps = n ?? t.privateMinSol, Ts = c, Re = parseFloat(re), Kt = x.status === "enrolled_locked" || x.status === "enrolled_unlocked" || x.status === "unlocked", rt = Kt && x.isUnlocked, st = Kt && !x.isUnlocked, Gt = C(() => {
    let Y = I === "sign" ? [
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
    return y && (Y = [{ key: "explainer", label: "Info" }, ...Y]), Y;
  }, [I, y])(), Ls = Gt.findIndex((W) => W.key === H), $t = C((W) => {
    Q(W);
  }, []), _s = C(
    async (W) => {
      if (!f) {
        D(I === "sign" ? "confirm" : "show-address");
        return;
      }
      tt(!0), j(null);
      try {
        const Y = await f(W, I === "sign" ? Re : null, U);
        ce(Y.sessionId), Qt(Y.depositAddress), D(I === "sign" ? "confirm" : "show-address");
      } catch (V) {
        const Y = V instanceof Error ? V : new Error("Authorization failed");
        j(Y.message);
      } finally {
        tt(!1);
      }
    },
    [f, I, Re, U]
  ), Ms = C(
    async (W, V) => {
      P(), j(null), D("signing");
      const Y = W ?? Re, J = V ?? U;
      if (!m) {
        if (st && p) {
          p(), D("confirm");
          return;
        }
        if (!rt) {
          j("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const ie = Math.floor(Y * Math.pow(10, J.decimals));
        if (m) {
          await new Promise((Ue) => setTimeout(Ue, 1500));
          const Ie = {
            token: r === "sol" ? null : J,
            amount: Y,
            amountSmallestUnit: ie,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: G || `demo-session-${Date.now()}`,
            response: {
              sessionId: G || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: ie,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          pe(Ie), D("success"), l?.(Ie);
          return;
        }
        const ae = await T(ie), De = {
          token: r === "sol" ? null : J,
          amount: Y,
          amountSmallestUnit: ie,
          txSignature: ae.txSignature,
          sessionId: ae.sessionId,
          response: ae,
          method: "sign"
        };
        pe(De), D("success"), l?.(De);
      } catch (ie) {
        const ae = ie instanceof Error ? ie : new Error("Deposit failed");
        j(ae.message), D("error"), d?.(ae);
      }
    },
    [
      T,
      Re,
      U,
      r,
      m,
      G,
      rt,
      st,
      p,
      l,
      d,
      P
    ]
  ), Bs = C(() => {
    D("waiting");
  }, []), ot = C(async () => {
    const W = be || x.solanaPubkey;
    if (W)
      try {
        await navigator.clipboard.writeText(W), Te(!0), setTimeout(() => Te(!1), 2e3);
      } catch {
        const V = document.createElement("textarea");
        V.value = W, document.body.appendChild(V), V.select(), document.execCommand("copy"), document.body.removeChild(V), Te(!0), setTimeout(() => Te(!1), 2e3);
      }
  }, [be, x.solanaPubkey]);
  F(() => {
    if (!(H === "confirm" || H === "show-address" || H === "waiting") || !G || m) return;
    let V = !1, Y = 0;
    const J = 360, ie = async () => {
      if (!(V || Y >= J)) {
        Y++;
        try {
          const ae = await A(G);
          if (ae.status === "completed" || ae.status === "detected") {
            const De = ae.amountLamports ? ae.amountLamports / Math.pow(10, U.decimals) : 0, Ie = ae.amountLamports || 0, Ue = {
              token: r === "sol" ? null : U,
              amount: De,
              amountSmallestUnit: Ie,
              txSignature: ae.txSignature || "",
              sessionId: G,
              response: ae,
              method: "receive",
              depositAddress: x.solanaPubkey ?? void 0
            };
            pe(Ue), D("success"), l?.(Ue);
            return;
          }
        } catch {
        }
        V || setTimeout(ie, g);
      }
    };
    return ie(), () => {
      V = !0;
    };
  }, [
    H,
    G,
    m,
    A,
    U,
    r,
    x.solanaPubkey,
    l,
    g
  ]), F(() => {
    if (!m || !b || H !== "waiting" || I !== "receive" || !be) return;
    const W = window.setTimeout(() => {
      const V = Be ?? t.privateMinUsd, Y = U.symbol === "SOL" && t.solPriceUsd > 0 ? V / t.solPriceUsd : V, J = Math.floor(Y * Math.pow(10, U.decimals)), ie = {
        token: r === "sol" ? null : U,
        amount: Y,
        amountSmallestUnit: J,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: G || `demo-session-${Date.now()}`,
        response: {
          sessionId: G || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: J,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: be ?? void 0
      };
      pe(ie), D("success"), l?.(ie);
    }, b);
    return () => window.clearTimeout(W);
  }, [
    m,
    b,
    H,
    I,
    be,
    Be,
    t,
    U,
    r,
    G,
    l
  ]);
  const Rs = C(() => {
    D(te()), oe(""), pe(null), j(null), P();
  }, [te, P]);
  return t.enabled ? /* @__PURE__ */ i("div", { className: `cedros-deposit-flow ${h}`, children: [
    w && H !== "error" && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-steps", children: Gt.map((W, V) => {
      const Y = Ls >= V, J = W.key === H;
      return /* @__PURE__ */ i(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${Y ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${Y ? "active" : ""} ${J ? "current" : ""}`,
                children: V + 1
              }
            ),
            /* @__PURE__ */ e("span", { className: `cedros-deposit-flow-step-label ${Y ? "active" : ""}`, children: W.label })
          ]
        },
        W.key
      );
    }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-content", children: [
      H === "explainer" && /* @__PURE__ */ e(
        ci,
        {
          siteName: N,
          config: E,
          depositConfig: t,
          currencyMode: r,
          token: U,
          tokens: B,
          onContinue: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "unlock" && /* @__PURE__ */ e(
        di,
        {
          token: U,
          tokens: B,
          currencyMode: r,
          depositMethod: I,
          isAuthorizing: xs,
          error: z,
          onAuthorize: _s,
          onBack: y ? () => D("explainer") : void 0,
          onCancel: u
        }
      ),
      H === "confirm" && I === "sign" && /* @__PURE__ */ e(
        ui,
        {
          token: U,
          tokens: L,
          quickActionSymbols: M,
          customTokenSymbols: _,
          currencyMode: r,
          minAmount: Ps,
          maxAmount: Ts,
          depositAddress: be || x.solanaPubkey,
          walletReady: rt || m,
          needsUnlock: st && !m,
          copied: et,
          isListening: !!G && !m,
          config: t,
          onCopy: ot,
          onTokenSelect: $t,
          onUnlockRequired: p,
          onConfirm: (W, V) => Ms(W, V),
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "signing" && /* @__PURE__ */ e(hi, { depositAddress: x.solanaPubkey }),
      H === "show-address" && /* @__PURE__ */ e(
        pi,
        {
          token: U,
          tokens: L,
          quickActionSymbols: M,
          customTokenSymbols: _,
          tokenPriceUsd: v,
          currencyMode: r,
          depositAddress: be || x.solanaPubkey,
          copied: et,
          isListening: !!G && !m,
          config: t,
          onCopy: ot,
          onTokenSelect: $t,
          onAmountChange: Yt,
          onSent: Bs,
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "waiting" && /* @__PURE__ */ e(
        mi,
        {
          token: U,
          depositAddress: be || x.solanaPubkey,
          copied: et,
          feeLine: Be ? `Fees: $${Math.max(Ze(t, Be), 0.01).toFixed(2)} total` : "Fees: calculated after deposit",
          onCopy: ot
        }
      ),
      H === "success" && fe && /* @__PURE__ */ e(fi, { result: fe, config: t, onNewDeposit: Rs }),
      H === "error" && /* @__PURE__ */ e(
        gi,
        {
          error: z || S || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ e("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${h}`, children: /* @__PURE__ */ e("p", { children: "Deposits are not currently available." }) });
}
function ci({
  siteName: t,
  config: r,
  depositConfig: o,
  currencyMode: a,
  token: s,
  tokens: n,
  onContinue: c,
  onCancel: l
}) {
  const d = r?.title ?? "How Deposits Work", u = r?.exchangeName ?? "Coinbase", p = zs(r?.exchangeUrl) ?? "https://www.coinbase.com", f = r?.showExchangeSuggestion !== !1, h = As(a, s, n), w = t ? `${t} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", g = r?.body ?? w, m = ni(o), b = li(o);
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: d }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: g }),
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
          /* @__PURE__ */ e("strong", { children: m ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ e("p", { children: b })
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
      l && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: l,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: c,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function di({
  token: t,
  tokens: r,
  currencyMode: o,
  depositMethod: a,
  isAuthorizing: s,
  error: n,
  onAuthorize: c,
  onBack: l
}) {
  const [d, u] = k(""), p = As(o, t, r), f = (h) => {
    h.preventDefault(), d.trim() && c(d);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: a === "sign" ? o === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${p} deposit. This allows us to process your withdrawal when the privacy period ends.` : o === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${p} sent to this address will be credited to your account.` }),
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
            onClick: l,
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
function ui({
  token: t,
  tokens: r,
  quickActionSymbols: o,
  customTokenSymbols: a,
  currencyMode: s,
  minAmount: n,
  maxAmount: c,
  depositAddress: l,
  walletReady: d,
  needsUnlock: u,
  copied: p,
  isListening: f,
  config: h,
  onCopy: w,
  onTokenSelect: g,
  onUnlockRequired: m,
  onConfirm: b,
  onBack: v
}) {
  const [y, N] = k(h.privateMinUsd), [E, T] = k(!1), [A, S] = k(!1), [P, x] = k(0), [M, _] = k(null), B = jt(y, h) === "sol_micro", R = t.symbol === xe.symbol, I = O(() => {
    const z = a.length === 0 ? r : r.filter((ce) => a.includes(ce.symbol)), j = z.length > 0 ? z : r;
    return j.some((ce) => ce.symbol === xe.symbol) ? j : [...j, xe];
  }, [r, a]), Z = Ze(h, y), he = Z < 0.01 ? 0.01 : Z, te = R ? "Fees: calculated after deposit" : `Fees: $${he.toFixed(2)} total`, H = R ? "" : bs(h, y, Z), D = ks(B ? Se : t, h), U = D ? y / D : t.symbol === "SOL" && h.solPriceUsd > 0 ? y / h.solPriceUsd : y, Q = U ? Ns(U, B ? "SOL" : t.symbol) : null, oe = y - Z <= 0 && y > 0, fe = !R && y > 0 && !oe && U >= n && U <= c;
  F(() => {
    if (s === "multi-token")
      if (B && t.symbol !== "SOL") {
        _(t);
        const z = r.find((j) => j.symbol === "SOL");
        z && g(z);
      } else !B && M && t.symbol === "SOL" && (g(M), _(null));
  }, [B, t.symbol, s, r, g, M, t]);
  const pe = () => {
    fe && b(U, t);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    s === "multi-token" && !B && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        o.map((z) => {
          const j = r.find((ce) => ce.symbol === z), G = t.symbol === z;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${G ? "is-active" : ""}`,
              onClick: () => {
                j && (T(!1), g(j));
              },
              disabled: !j,
              children: [
                j?.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: j.logoUrl,
                    alt: `${z} logo`
                  }
                ),
                z
              ]
            },
            z
          );
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${E ? "is-active" : ""}`,
            onClick: () => {
              T(!0), x((z) => z + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      E && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        ms,
        {
          tokens: I,
          selectedToken: t,
          onSelect: g,
          openSignal: P
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ e(
      ws,
      {
        config: h,
        valueUsd: y,
        onChange: N,
        maxUsd: ys
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: R ? "Sign to send tokens to this address" : `Sign to send ${Q ?? "--"} ${B ? "SOL" : t.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ e("code", { className: "cedros-deposit-flow-address", children: l || "Loading..." }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: w,
              title: "Copy address",
              disabled: !l,
              children: p ? "✓" : "⧉"
            }
          ),
          l && /* @__PURE__ */ e(
            "a",
            {
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
              href: `https://orbmarkets.io/account/${l}`,
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
          te,
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${A ? "is-open" : ""}`,
              "data-tooltip": H,
              "aria-label": `Fee breakdown: ${H.replaceAll(`
`, ", ")}`,
              "aria-expanded": A,
              onClick: (z) => {
                z.stopPropagation(), S((j) => !j);
              },
              onBlur: () => S(!1),
              onKeyDown: (z) => {
                z.key === "Escape" && S(!1);
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
      m && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: m,
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
          onClick: v,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: pe,
          disabled: !fe || !d || !l,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function hi({ depositAddress: t }) {
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
function pi({
  token: t,
  tokens: r,
  quickActionSymbols: o,
  customTokenSymbols: a,
  tokenPriceUsd: s,
  currencyMode: n,
  depositAddress: c,
  copied: l,
  isListening: d,
  config: u,
  onCopy: p,
  onTokenSelect: f,
  onAmountChange: h,
  onSent: w,
  onBack: g
}) {
  const [m, b] = k(u.privateMinUsd), [v, y] = k(!1), [N, E] = k(!1), [T, A] = k(0), [S, P] = k(null), M = jt(m, u) === "sol_micro", _ = t.symbol === xe.symbol, L = O(() => {
    const U = a.length === 0 ? r : r.filter((oe) => a.includes(oe.symbol)), Q = U.length > 0 ? U : r;
    return Q.some((oe) => oe.symbol === xe.symbol) ? Q : [...Q, xe];
  }, [r, a]), B = Ze(u, m), R = B < 0.01 ? 0.01 : B, I = _ ? "Fees: calculated after deposit" : `Fees: $${R.toFixed(2)} total`, Z = _ ? "" : bs(u, m, B), he = _ || m > 0, te = ks(M ? Se : t, u, s), H = te ? m / te : null, D = H ? Ns(H, t.symbol) : null;
  return F(() => {
    if (n === "multi-token")
      if (M && t.symbol !== "SOL") {
        P(t);
        const U = r.find((Q) => Q.symbol === "SOL");
        U && f(U);
      } else !M && S && t.symbol === "SOL" && (f(S), P(null));
  }, [M, t.symbol, n, r, f, S, t]), F(() => {
    h(m);
  }, [m, h]), c ? /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    n === "multi-token" && !M && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        o.map((U) => {
          const Q = r.find((oe) => oe.symbol === U), re = t.symbol === U;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${re ? "is-active" : ""}`,
              onClick: () => {
                Q && (y(!1), f(Q));
              },
              disabled: !Q,
              children: [
                Q?.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: Q.logoUrl,
                    alt: `${U} logo`
                  }
                ),
                U
              ]
            },
            U
          );
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${v ? "is-active" : ""}`,
            onClick: () => {
              y(!0), A((U) => U + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      v && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        ms,
        {
          tokens: L,
          selectedToken: t,
          onSelect: f,
          openSignal: T
        }
      ) })
    ] }),
    !_ && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ e(
        ws,
        {
          config: u,
          valueUsd: m,
          onChange: b,
          maxUsd: ys
        }
      )
    ] }),
    _ && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: _ ? "Send any token to this address" : `Send ${D ?? "--"} ${M ? "SOL" : t.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ e("code", { className: "cedros-deposit-flow-address", children: c }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: p,
            title: "Copy address",
            children: l ? "✓" : "📋"
          }
        )
      ] }),
      l && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ e("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ i("span", { children: [
          I,
          !_ && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${N ? "is-open" : ""}`,
              "data-tooltip": Z,
              "aria-label": `Fee breakdown: ${Z.replaceAll(`
`, ", ")}`,
              "aria-expanded": N,
              onClick: (U) => {
                U.stopPropagation(), E((Q) => !Q);
              },
              onBlur: () => E(!1),
              onKeyDown: (U) => {
                U.key === "Escape" && E(!1);
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
          onClick: g,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: w,
          disabled: !he,
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
function mi({ token: t, depositAddress: r, copied: o, feeLine: a, onCopy: s }) {
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
function fi({ result: t, config: r, onNewDeposit: o }) {
  const a = t.token ?? Se, s = a.symbol === "SOL" && r.solPriceUsd > 0 ? t.amount * r.solPriceUsd : t.amount, n = Ze(r, s), c = Math.max(s - n, 0), l = n < 0.01 ? 0.01 : n;
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
          l.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          c.toFixed(2)
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
function gi({ error: t, onRetry: r, onCancel: o }) {
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
const wi = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", yi = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", bi = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Ai = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", vi = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", ki = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ni = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", Ci = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Ei = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e", Si = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: zt
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: ki
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Ei
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: bi
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: Ci
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: vi
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Ni
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: yi
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: wi
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Ai
  }
];
function Cs() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), n = O(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), c = C(() => {
    s(null);
  }, []), l = C(async () => {
    if (!n)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return await n.get("/credits/balance/sol");
    } catch (p) {
      const f = q(p, "Failed to fetch credit balance");
      throw s(f.message), f;
    } finally {
      o(!1);
    }
  }, [n]), d = C(async () => {
    if (!n)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return (await n.get("/credits/balance")).balances;
    } catch (p) {
      const f = q(p, "Failed to fetch credit balances");
      throw s(f.message), f;
    } finally {
      o(!1);
    }
  }, [n]), u = C(
    async (p) => {
      if (!n)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const f = new URLSearchParams();
        p?.currency && f.set("currency", p.currency), p?.limit && f.set("limit", p.limit.toString()), p?.offset && f.set("offset", p.offset.toString());
        const h = f.toString(), w = h ? `/credits/history?${h}` : "/credits/history";
        return await n.get(w);
      } catch (f) {
        const h = q(f, "Failed to fetch transaction history");
        throw s(h.message), h;
      } finally {
        o(!1);
      }
    },
    [n]
  );
  return {
    getBalance: l,
    getAllBalances: d,
    getHistory: u,
    isLoading: r,
    error: a,
    clearError: c
  };
}
function El({
  showAllCurrencies: t = !1,
  refreshInterval: r = 0,
  compact: o = !1,
  className: a = "",
  onLoad: s
}) {
  const { getBalance: n, getAllBalances: c, isLoading: l, error: d, clearError: u } = Cs(), [p, f] = k([]), [h, w] = k(null), g = C(async () => {
    try {
      if (t) {
        const m = await c();
        f(m), s?.(m);
      } else {
        const m = await n();
        f([m]), s?.([m]);
      }
      w(null);
    } catch (m) {
      w(m instanceof Error ? m.message : "Failed to load balance");
    }
  }, [t, n, c, s]);
  if (F(() => {
    g();
  }, [g]), F(() => {
    if (r <= 0) return;
    const m = setInterval(g, r);
    return () => clearInterval(m);
  }, [r, g]), h || d)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-error", children: h || d }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            u(), w(null), g();
          },
          children: "Retry"
        }
      )
    ] });
  if (l && p.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (o) {
    const m = p[0];
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${a}`, children: [
      m ? /* @__PURE__ */ e(
        "span",
        {
          className: "cedros-credit-value",
          title: `${m.balanceLamports} lamports`,
          children: m.display
        }
      ) : /* @__PURE__ */ e("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      l && /* @__PURE__ */ e("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
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
          onClick: g,
          disabled: l,
          title: "Refresh balance",
          children: l ? "..." : "↻"
        }
      )
    ] }),
    p.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-credit-list", children: p.map((m) => /* @__PURE__ */ i("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-currency", children: m.currency }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-amount", children: m.display })
    ] }, m.currency)) })
  ] });
}
const Tt = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function xi(t, r) {
  const o = t < 0, a = Math.abs(t), s = r.toUpperCase() === "SOL", c = a / Math.pow(10, s ? 9 : 6), l = o ? "-" : "+";
  return s ? `${l}${c.toFixed(4)} SOL` : `${l}$${c.toFixed(2)}`;
}
function Pi(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = o.getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const n = Math.floor(a / 36e5);
    if (n === 0) {
      const c = Math.floor(a / 6e4);
      return c < 1 ? "Just now" : `${c}m ago`;
    }
    return `${n}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== o.getFullYear() ? "numeric" : void 0
  });
}
function Ti(t) {
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
function Li(t, r) {
  const o = (t || "").toLowerCase();
  return o === "deposit" ? "↓" : o === "spend" || o === "usage" || o === "charge" ? "↑" : o === "refund" ? "←" : o === "bonus" || o === "credit" ? "★" : r ? "+" : "−";
}
function Sl({
  defaultTab: t = "all",
  pageSize: r = 10,
  refreshInterval: o = 0,
  className: a = "",
  onLoad: s,
  onTransactionClick: n
}) {
  const { getHistory: c, isLoading: l, error: d, clearError: u } = Cs(), [p, f] = k(t), [h, w] = k([]), [g, m] = k(0), [b, v] = k(0), [y, N] = k(null), E = Tt.find((L) => L.key === p) || Tt[0], T = O(() => E.txTypes === null ? h : h.filter((L) => {
    const B = L.txType || "";
    return E.txTypes.some((R) => B.toLowerCase().includes(R.toLowerCase()));
  }), [h, E.txTypes]), A = C(async () => {
    try {
      const L = await c({ limit: r * 3, offset: b });
      w(L.transactions), m(L.total), s?.(L), N(null);
    } catch (L) {
      N(L instanceof Error ? L.message : "Failed to load history");
    }
  }, [r, b, c, s]);
  F(() => {
    v(0);
  }, [p]), F(() => {
    A();
  }, [A]), F(() => {
    if (o <= 0) return;
    const L = setInterval(A, o);
    return () => clearInterval(L);
  }, [o, A]);
  const S = Math.ceil(g / r), P = Math.floor(b / r) + 1, x = (L) => {
    const B = (L - 1) * r;
    v(Math.max(0, Math.min(B, Math.max(0, g - 1))));
  }, M = (L) => {
    f(L);
  };
  if (y || d)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-error", children: y || d }),
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
  if (l && h.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const _ = (L) => L.txTypes === null ? h.length : h.filter((B) => {
    const R = B.txType || "";
    return L.txTypes.some((I) => R.toLowerCase().includes(I.toLowerCase()));
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
          disabled: l,
          title: "Refresh",
          children: l ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-tx-tabs", children: Tt.map((L) => {
      const B = _(L), R = p === L.key;
      return /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${R ? "cedros-tx-tab-active" : ""}`,
          onClick: () => M(L.key),
          children: [
            L.label,
            B > 0 && /* @__PURE__ */ e("span", { className: "cedros-tx-tab-count", children: B })
          ]
        },
        L.key
      );
    }) }),
    T.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: p === "all" ? "No transactions yet." : `No ${E.label.toLowerCase()} found.` }),
      p === "all" && /* @__PURE__ */ e("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: T.slice(0, r).map((L) => {
        const B = L.amountLamports >= 0;
        return /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-tx-item ${B ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => n?.(L),
            onKeyDown: (R) => {
              (R.key === "Enter" || R.key === " ") && (R.preventDefault(), n?.(L));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `cedros-tx-icon ${B ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: Li(L.txType, B)
                }
              ),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-type", children: Ti(L.txType) }),
                  /* @__PURE__ */ e(
                    "span",
                    {
                      className: `cedros-tx-amount ${B ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: xi(L.amountLamports, L.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-description", children: L.description }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: Pi(L.createdAt) })
                ] })
              ] })
            ]
          },
          L.id
        );
      }) }),
      S > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => x(P - 1),
            disabled: P <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          P,
          " of ",
          S
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => x(P + 1),
            disabled: P >= S,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Es() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), [n, c] = k(null), l = O(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = C(() => {
    s(null);
  }, []), u = C(async () => {
    if (!l)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await l.get("/wallet/withdraw/balances");
    } catch (w) {
      const g = q(w, "Failed to fetch wallet balances");
      throw s(g.message), g;
    }
  }, [l]), p = C(
    async (w, g) => {
      if (!l)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const m = await l.post("/wallet/withdraw/sol", {
          destination: w,
          amount_lamports: g
        });
        return c(m), m;
      } catch (m) {
        const b = q(m, "Failed to withdraw SOL");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [l]
  ), f = C(
    async (w, g, m) => {
      if (!l)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const b = await l.post("/wallet/withdraw/spl", {
          destination: w,
          token_mint: g,
          amount: m
        });
        return c(b), b;
      } catch (b) {
        const v = q(b, "Failed to withdraw token");
        throw s(v.message), v;
      } finally {
        o(!1);
      }
    },
    [l]
  ), h = C(
    async (w = 10, g = 0) => {
      if (!l)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const m = Math.max(1, Math.min(100, Math.trunc(w))), b = Math.max(0, Math.trunc(g)), v = new URLSearchParams({
          limit: String(m),
          offset: String(b)
        });
        return await l.get(
          `/wallet/withdraw/history?${v}`
        );
      } catch (m) {
        const b = q(m, "Failed to fetch withdrawal history");
        throw s(b.message), b;
      }
    },
    [l]
  );
  return {
    withdrawSol: p,
    withdrawSpl: f,
    getBalances: u,
    getHistory: h,
    isSubmitting: r,
    error: a,
    clearError: d,
    lastResult: n
  };
}
const Lt = "So11111111111111111111111111111111111111112", _i = {
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
function Mi(t) {
  return t.length < 32 || t.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(t);
}
function _t(t) {
  return t.length <= 16 ? t : `${t.slice(0, 6)}...${t.slice(-6)}`;
}
function qe(t, r) {
  return (Number(t) / Math.pow(10, r)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(r, 6)
  });
}
function xl({
  onSuccess: t,
  onError: r,
  onCancel: o,
  className: a = ""
}) {
  const s = ve(), { withdrawSol: n, withdrawSpl: c, getBalances: l, isSubmitting: d, error: u, clearError: p } = Es(), [f, h] = k("loading"), [w, g] = k([]), [m, b] = k(null), [v, y] = k(""), [N, E] = k(""), [T, A] = k(null), [S, P] = k(null), [x, M] = k(null), _ = s?.config.solana?.network ?? "mainnet-beta", L = O(() => {
    if (!T?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${T.txSignature}`;
    return _ === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(_)}`;
  }, [T, _]), B = O(() => {
    if (!m || !N) return "0";
    const D = parseFloat(N);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, m.decimals)).toString();
  }, [N, m]);
  F(() => {
    if (!s) return;
    let D = !1;
    return (async () => {
      try {
        const U = await l();
        if (D) return;
        const Q = [];
        U.solLamports > 0 && Q.push({
          symbol: "SOL",
          mint: Lt,
          decimals: 9,
          rawBalance: String(U.solLamports),
          displayBalance: qe(String(U.solLamports), 9)
        });
        for (const re of U.tokens) {
          const oe = _i[re.mint] ?? _t(re.mint);
          Q.push({
            symbol: oe,
            mint: re.mint,
            decimals: re.decimals,
            rawBalance: re.amount,
            displayBalance: qe(re.amount, re.decimals)
          });
        }
        g(Q), h((Q.length > 0, "select"));
      } catch {
        D || (M("Failed to load wallet balances"), h("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [s, l]);
  const R = C(
    (D) => {
      b(D), h("form"), p(), P(null), E("");
    },
    [p]
  ), I = C(() => {
    if (!m) return;
    const D = Number(m.rawBalance) / Math.pow(10, m.decimals);
    m.mint === Lt ? E(String(Math.max(0, D - 0.01))) : E(String(D));
  }, [m]), Z = C(() => {
    if (P(null), !v.trim()) {
      P("Destination address is required");
      return;
    }
    if (!Mi(v.trim())) {
      P("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      P("Please enter a valid amount");
      return;
    }
    if (B === "0") {
      P("Amount is too small");
      return;
    }
    h("confirm");
  }, [v, N, B]), he = C(async () => {
    if (m) {
      h("processing"), p();
      try {
        let D;
        m.mint === Lt ? D = await n(v.trim(), Number(B)) : D = await c(v.trim(), m.mint, B), A(D), h("success"), t?.(D);
      } catch (D) {
        h("confirm"), r?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    m,
    v,
    B,
    n,
    c,
    p,
    t,
    r
  ]), te = C(() => {
    p(), P(null), f === "form" ? (h("select"), b(null), E(""), y("")) : f === "confirm" && h("form");
  }, [f, p]), H = C(() => {
    h("select"), b(null), y(""), E(""), A(null), p(), P(null);
  }, [p]);
  return s ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal ${a}`, children: [
    f === "loading" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ e(K, {}),
      /* @__PURE__ */ e("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    f === "select" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ e("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      x && /* @__PURE__ */ e(ee, { error: x }),
      w.length === 0 && !x && /* @__PURE__ */ e("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ e("div", { className: "cedros-withdrawal-tokens", children: w.map((D) => /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => R(D),
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
    f === "form" && m && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: te,
            children: "Back"
          }
        ),
        /* @__PURE__ */ i("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          m.symbol
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        m.displayBalance,
        " ",
        m.symbol
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
            value: v,
            onChange: (D) => y(D.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ i("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          m.symbol,
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
              onClick: I,
              children: "Max"
            }
          )
        ] })
      ] }),
      (S || u) && /* @__PURE__ */ e(ee, { error: S || u || "" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: Z,
          children: "Review Withdrawal"
        }
      )
    ] }),
    f === "confirm" && m && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: te,
            disabled: d,
            children: "Back"
          }
        ),
        /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", children: m.symbol })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ i("span", { className: "cedros-withdrawal-summary-value", children: [
            qe(B, m.decimals),
            " ",
            m.symbol
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", title: v, children: _t(v) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      u && /* @__PURE__ */ e(ee, { error: u }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: te,
            disabled: d,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: he,
            disabled: d,
            children: d ? "Sending..." : "Confirm & Send"
          }
        )
      ] })
    ] }),
    f === "processing" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ e(K, {}),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        m?.symbol,
        "..."
      ] })
    ] }),
    f === "success" && T && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ e("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-subtitle", children: [
        qe(B, m?.decimals ?? 9),
        " ",
        m?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ e("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ e(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: L,
            target: "_blank",
            rel: "noreferrer",
            children: _t(T.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-withdrawal-done",
          onClick: H,
          children: "Done"
        }
      )
    ] })
  ] }) : null;
}
function Bi(t, r) {
  if (t === "sol") return "SOL";
  if (!r) return "SPL";
  const o = Si.find((a) => a.mint === r);
  return o ? o.symbol : `${r.slice(0, 4)}...${r.slice(-4)}`;
}
function Ri(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function Di(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = o.getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const n = Math.floor(a / 36e5);
    if (n === 0) {
      const c = Math.floor(a / 6e4);
      return c < 1 ? "Just now" : `${c}m ago`;
    }
    return `${n}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== o.getFullYear() ? "numeric" : void 0
  });
}
function Pl({
  pageSize: t = 10,
  className: r = "",
  onTransactionClick: o,
  explorerUrl: a = "https://solscan.io"
}) {
  const { getHistory: s, error: n, clearError: c } = Es(), [l, d] = k([]), [u, p] = k(0), [f, h] = k(0), [w, g] = k(!1), [m, b] = k(null), v = C(async () => {
    g(!0);
    try {
      const T = await s(t, f);
      d(T.items), p(T.total), b(null);
    } catch (T) {
      b(T instanceof Error ? T.message : "Failed to load withdrawal history");
    } finally {
      g(!1);
    }
  }, [t, f, s]);
  F(() => {
    v();
  }, [v]);
  const y = Math.ceil(u / t), N = Math.floor(f / t) + 1, E = (T) => {
    const A = (T - 1) * t;
    h(Math.max(0, Math.min(A, Math.max(0, u - 1))));
  };
  return m || n ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${r}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-withdrawal-error", children: m || n }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          c(), b(null), v();
        },
        children: "Retry"
      }
    )
  ] }) : w && l.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${r}`, children: [
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
          onClick: v,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    l.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: l.map((T) => {
        const A = Bi(T.tokenType, T.tokenMint);
        return /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => o?.(T),
            onKeyDown: (S) => {
              (S.key === "Enter" || S.key === " ") && (S.preventDefault(), o?.(T));
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
                    T.amount,
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
                        href: `${a}/account/${T.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (S) => S.stopPropagation(),
                        children: Ri(T.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ e(
                      "a",
                      {
                        href: `${a}/tx/${T.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (S) => S.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: Di(T.createdAt) })
                ] })
              ] })
            ]
          },
          T.id
        );
      }) }),
      y > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
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
          y
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => E(N + 1),
            disabled: N >= y,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Tl({
  brandLogo: t,
  brandName: r,
  title: o = "Welcome back",
  subtitle: a = "Login with your Apple or Google account",
  termsText: s,
  onSuccess: n,
  defaultTab: c = "login",
  children: l,
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
      l ?? /* @__PURE__ */ e(Ot, { defaultTab: c, onSuccess: n })
    ] }),
    s && /* @__PURE__ */ e("p", { className: "cedros-terms-footer", children: s })
  ] });
}
function Ll({
  brandName: t = "Your Brand",
  brandLogo: r,
  tagline: o = "Your tagline goes here. Make it compelling.",
  title: a = "Sign in",
  subtitle: s = "Enter your credentials to access your account",
  onSuccess: n,
  defaultTab: c = "login",
  children: l,
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
      l ?? /* @__PURE__ */ e(Ot, { defaultTab: c, onSuccess: n })
    ] }) })
  ] });
}
class Ii {
  client;
  constructor(r, o, a, s) {
    this.client = new ue({ baseUrl: r, timeoutMs: o, retryAttempts: a, getAccessToken: s });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (r) {
      throw q(r, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (r) {
      throw q(r, "Failed to revoke sessions");
    }
  }
}
function _l() {
  const { config: t, authState: r, _internal: o } = ne(), [a, s] = k([]), [n, c] = k(!1), [l, d] = k(null), u = O(
    () => new Ii(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), p = C(async () => {
    if (r !== "authenticated") {
      s([]);
      return;
    }
    c(!0), d(null);
    try {
      const w = await u.listSessions();
      s(w);
    } catch (w) {
      d(w);
    } finally {
      c(!1);
    }
  }, [r, u]);
  F(() => {
    r === "authenticated" ? p() : s([]);
  }, [r, p]);
  const f = C(async () => {
    c(!0), d(null);
    try {
      const w = await u.revokeAllSessions();
      return await p(), w;
    } catch (w) {
      throw d(w), w;
    } finally {
      c(!1);
    }
  }, [u, p]), h = O(() => a.filter((w) => !w.isCurrent).length, [a]);
  return {
    sessions: a,
    isLoading: n,
    error: l,
    fetchSessions: p,
    revokeAllSessions: f,
    otherSessionCount: h
  };
}
function Ml() {
  const { config: t, _internal: r } = ne(), [o, a] = k({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), s = O(
    () => new ao(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      r?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), n = C(
    async (d) => {
      a((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await s.authorize(d), p = {
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
    [s]
  ), c = C(
    async (d) => (await n(d)).allowed,
    [n]
  ), l = C(() => {
    a({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: c,
    lastCheck: o,
    clearCheck: l,
    checkAuthorization: n
  };
}
function Bl() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), [n, c] = k(null), l = O(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = C(async () => {
    if (!l)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      const f = await l.get("/wallet/pending-recovery");
      c(f);
    } catch (f) {
      const h = q(f, "Failed to fetch pending recovery");
      throw s(h.message), h;
    } finally {
      o(!1);
    }
  }, [l]), u = C(async () => {
    if (!l)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      const f = { confirmed: !0 };
      await l.post("/wallet/acknowledge-recovery", f), c(null);
    } catch (f) {
      const h = q(f, "Failed to acknowledge recovery");
      throw s(h.message), h;
    } finally {
      o(!1);
    }
  }, [l]), p = C(() => s(null), []);
  return F(() => {
    l && t?.authState === "authenticated" && d().catch(() => {
    });
  }, [l, t?.authState, d]), {
    hasPendingRecovery: n?.hasPendingRecovery ?? !1,
    recoveryType: n?.recoveryType ?? null,
    recoveryPhrase: n?.recoveryPhrase ?? null,
    expiresAt: n?.expiresAt ? new Date(n.expiresAt) : null,
    fetchPendingRecovery: d,
    acknowledgeRecovery: u,
    isLoading: r,
    error: a,
    clearError: p
  };
}
function Rl(t = {}) {
  const { onExternalSign: r } = t, { solanaPubkey: o, hasExternalWallet: a, status: s, isUnlocked: n } = Xe(), {
    signTransaction: c,
    isSigning: l,
    error: d,
    clearError: u
  } = Ln(), p = O(() => a && r ? "external" : s === "enrolled_locked" || s === "enrolled_unlocked" ? "sss" : "none", [a, r, s]), f = p !== "none", h = s === "enrolled_locked" || s === "enrolled_unlocked";
  return {
    signTransaction: C(
      async (g, m) => {
        if (p === "external") {
          if (!r)
            throw new Error("External wallet signing callback not provided");
          return r(g);
        }
        if (p === "sss") {
          if (!m && !n)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return m ? c(g, m) : c(g);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [p, r, n, c]
    ),
    signingMethod: p,
    canSign: f,
    isSigning: l,
    publicKey: o,
    hasExternalWallet: a,
    hasSssWallet: h,
    isSssUnlocked: n,
    error: d,
    clearError: u
  };
}
const Ht = js(null), Dt = {
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
function Ui(t, r) {
  return Ss(t, r);
}
function Ss(t, r) {
  const o = { ...t };
  for (const a in r)
    if (Object.prototype.hasOwnProperty.call(r, a)) {
      const s = t[a], n = r[a];
      typeof s == "object" && s !== null && typeof n == "object" && n !== null ? o[a] = Ss(
        s,
        n
      ) : n !== void 0 && (o[a] = n);
    }
  return o;
}
function Dl({
  children: t,
  locale: r = "en",
  translations: o
}) {
  const a = O(() => ({ t: o ? Ui(Dt, o) : Dt, locale: r }), [o, r]);
  return /* @__PURE__ */ e(Ht.Provider, { value: a, children: t });
}
function Il() {
  return jr(Ht)?.t ?? Dt;
}
function Ul() {
  return jr(Ht)?.locale ?? "en";
}
export {
  lo as AdminDepositList,
  io as AdminDepositStats,
  oc as AdminIcons,
  uo as AdminPrivacyPeriodDeposits,
  nc as AdminShell,
  go as AdminUserList,
  po as AdminWithdrawalHistory,
  ho as AdminWithdrawalQueue,
  co as AdminWithdrawalStats,
  Xo as AppleLoginButton,
  yo as AuthenticationSettings,
  wl as CapabilityWarning,
  vl as CedrosAdminDashboard,
  Ol as CedrosLoginProvider,
  El as CreditBalance,
  No as CreditSystemSettings,
  Cl as DepositFlow,
  Hs as EmailLoginForm,
  Qs as EmailRegisterForm,
  hc as EmailSettings,
  bo as EmbeddedWalletSettings,
  an as ErrorBoundary,
  ee as ErrorMessage,
  Go as ForgotPasswordForm,
  Tl as FullPageLayout,
  Ks as GoogleLoginButton,
  Sl as History,
  Dl as I18nProvider,
  to as InviteForm,
  ro as InviteList,
  K as LoadingSpinner,
  ul as LoginButton,
  Ot as LoginForm,
  hl as LoginModal,
  eo as MemberList,
  ml as OrgSelector,
  fl as OrgSwitcher,
  Vr as OtpInput,
  on as PasskeyLoginButton,
  Mn as PasskeyPrompt,
  we as PasswordInput,
  No as PrivacyCashSettings,
  wo as ProfileDropdown,
  Nn as RecoveryPhraseDisplay,
  Cn as RecoveryPhraseInput,
  pl as ResetPasswordForm,
  Si as SUPPORTED_TOKENS,
  Al as SecuritySettings,
  Co as ServerSettings,
  gl as SessionList,
  To as SettingsPageLayout,
  ma as SetupWizard,
  Gs as SolanaLoginButton,
  Ll as SplitPageLayout,
  bl as SystemSettings,
  ws as TieredAmountSlider,
  ms as TokenSelector,
  kl as TotpSettings,
  Ga as TotpSetup,
  Yl as TotpVerify,
  Nl as UserProfileSettings,
  Qn as WalletAddressRow,
  Tn as WalletEnrollment,
  yl as WalletManager,
  qn as WalletRecovery,
  Yn as WalletStatus,
  In as WalletUnlock,
  mc as WebhookSettings,
  xl as WithdrawalFlow,
  Pl as WithdrawalHistory,
  ac as cedrosLoginPlugin,
  Dt as defaultTranslations,
  ql as getEmbeddedWalletInfo,
  jt as getTierForAmount,
  jl as isEmbeddedWalletAvailable,
  ic as loginPlugin,
  Ui as mergeTranslations,
  dc as useAdminDeposits,
  lc as useAdminShell,
  rc as useAdminUsers,
  Jo as useAppleAuth,
  Br as useAuth,
  Vl as useAuthState,
  Hl as useAuthUI,
  Ml as useAuthorize,
  ne as useCedrosLogin,
  Cs as useCredits,
  Xa as useDeposit,
  Kl as useEmailAuth,
  Xl as useGoogleAuth,
  Gl as useInstantLink,
  Zs as useInvites,
  Ul as useLocale,
  Xs as useMembers,
  no as useOrgs,
  _n as usePasskeySigning,
  ss as usePasswordReset,
  Bl as usePendingRecovery,
  Ja as useProfile,
  $s as useServerFeatures,
  _l as useSessions,
  ls as useSetup,
  ec as useSolanaAuth,
  oo as useSystemSettings,
  ps as useTotp,
  $l as useTotpVerify,
  Rl as useTransactionSigning,
  Il as useTranslations,
  Xe as useWallet,
  Pn as useWalletEnrollment,
  Me as useWalletMaterial,
  On as useWalletRecovery,
  Ln as useWalletSigning,
  sn as useWebAuthn,
  Es as useWithdrawal,
  Ut as validatePassword
};
