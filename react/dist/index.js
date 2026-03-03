import { f as ze, h as _s, u as Fr, i as Ws, j as Os, k as Pe, w as Ur, g as qs, b as _r, t as Wr, c as ge, a as Or, D as Ve, l as qr, r as js, m as _t, n as jr, o as zs, p as zr, q as Xe } from "./useAuth-m5Hf89v8.js";
import { C as Dc, x as Ic, s as Fc } from "./useAuth-m5Hf89v8.js";
import { u as ne, A as ue, h as O, a as ve } from "./useCedrosLogin-_94MmGGq.js";
import { b as _c, c as Wc } from "./useCedrosLogin-_94MmGGq.js";
import { jsx as e, jsxs as i, Fragment as X } from "react/jsx-runtime";
import { useState as k, useRef as $, useMemo as q, useEffect as _, useCallback as P, useId as Vr, Component as Vs, createContext as Hs, useContext as Hr } from "react";
import { L as K } from "./LoadingSpinner-6vml-zwr.js";
import { a as Qr, s as Qs } from "./sanitization-CQ-H1MSg.js";
import { b as Ys, E as Ks, a as Gs, P as we, O as Yr } from "./EmailRegisterForm-BAX_uBIt.js";
import { T as qc, u as jc, c as zc, d as Vc } from "./EmailRegisterForm-BAX_uBIt.js";
import { b as $s, v as Wt } from "./validation-B8kMV3BL.js";
import { E as ee } from "./ErrorMessage-CcEK0pYO.js";
import { G as Js } from "./GoogleLoginButton-B6qnNMZp.js";
import { u as Qc } from "./GoogleLoginButton-B6qnNMZp.js";
import { S as Xs } from "./mobileWalletAdapter-DMWmo9II.js";
import { r as Kc, u as Gc } from "./mobileWalletAdapter-DMWmo9II.js";
import { c as Zs, d as eo, u as to, a as ro, M as so, I as oo, b as no, P as ao } from "./PermissionsSection-CighC1p6.js";
import { u as io } from "./useSystemSettings-DBlAMjFi.js";
import { C as co, S as Kr, a as lo, u as uo, A as ho } from "./AutosaveStatus-vkJxtuEw.js";
import { u as po, O as mo } from "./useOrgs-C3pzMA9h.js";
import { A as fo, a as go } from "./AdminDepositList-CyT4VBH8.js";
import { A as wo, a as yo, b as bo, c as Ao } from "./AdminWithdrawalHistory-Cud-yuWy.js";
import { u as vo, A as ko, a as No } from "./useUsersStatsSummary-NjEFvWuz.js";
import { b as Jc } from "./useUsersStatsSummary-NjEFvWuz.js";
import { S as Gr } from "./StatsBar-BX-hHtTq.js";
import { P as Co } from "./plugin-DbkijwEV.js";
import { I as Zc, A as el, C as tl, c as rl, c as sl, u as ol } from "./plugin-DbkijwEV.js";
import { A as Eo } from "./AuthenticationSettings-DC64o_J6.js";
import { E as So } from "./EmbeddedWalletSettings-DY5iJhS0.js";
import { A as xo, S as Po, P as Lo } from "./EmailSettings-BVJ4vz0Y.js";
import { E as al } from "./EmailSettings-BVJ4vz0Y.js";
import { C as Mo } from "./CreditSystemSettings-DsRipb2R.js";
import { S as To } from "./ServerSettings-BAstMKHS.js";
import { b as Bo, c as Ro, s as $r, g as Jr, p as Xr, a as Zr, d as Do, e as Io } from "./shamir-OAB2zD9Y.js";
import { u as cl } from "./useAdminDeposits-BTSyeAfg.js";
import { S as Fo } from "./WebhookSettings-CXMBju7N.js";
import { W as dl } from "./WebhookSettings-CXMBju7N.js";
function He(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function es(t, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : t ? r.every((o) => typeof o == "string") : r.every((o) => Number.isSafeInteger(o)) : !1;
}
function Uo(t) {
  if (typeof t != "function")
    throw new Error("function expected");
  return !0;
}
function Qe(t, r) {
  if (typeof r != "string")
    throw new Error(`${t}: string expected`);
  return !0;
}
function Le(t) {
  if (!Number.isSafeInteger(t))
    throw new Error(`invalid integer: ${t}`);
}
function Ye(t) {
  if (!Array.isArray(t))
    throw new Error("array expected");
}
function Ke(t, r) {
  if (!es(!0, r))
    throw new Error(`${t}: array of strings expected`);
}
function ts(t, r) {
  if (!es(!1, r))
    throw new Error(`${t}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function _o(...t) {
  const r = (n) => n, o = (n, l) => (c) => n(l(c)), a = t.map((n) => n.encode).reduceRight(o, r), s = t.map((n) => n.decode).reduce(o, r);
  return { encode: a, decode: s };
}
// @__NO_SIDE_EFFECTS__
function Wo(t) {
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
      const l = a.get(n);
      if (l === void 0)
        throw new Error(`Unknown letter: "${n}". Allowed: ${t}`);
      return l;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function Oo(t = "") {
  return Qe("join", t), {
    encode: (r) => (Ke("join.decode", r), r.join(t)),
    decode: (r) => (Qe("join.decode", r), r.split(t))
  };
}
// @__NO_SIDE_EFFECTS__
function qo(t, r = "=") {
  return Le(t), Qe("padding", r), {
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
function Dt(t, r, o) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (o < 2)
    throw new Error(`convertRadix: invalid to=${o}, base cannot be less than 2`);
  if (Ye(t), !t.length)
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
      const h = n[u], f = r * c, g = f + h;
      if (!Number.isSafeInteger(g) || f / r !== c || g - h !== f)
        throw new Error("convertRadix: carry overflow");
      const w = g / o;
      c = g % o;
      const m = Math.floor(w);
      if (n[u] = m, !Number.isSafeInteger(m) || m * o + c !== g)
        throw new Error("convertRadix: carry overflow");
      if (d)
        m ? d = !1 : a = u;
      else continue;
    }
    if (s.push(c), d)
      break;
  }
  for (let c = 0; c < t.length - 1 && t[c] === 0; c++)
    s.push(0);
  return s.reverse();
}
const rs = (t, r) => r === 0 ? t : rs(r, t % r), Ge = /* @__NO_SIDE_EFFECTS__ */ (t, r) => t + (r - rs(t, r)), nt = /* @__PURE__ */ (() => {
  let t = [];
  for (let r = 0; r < 40; r++)
    t.push(2 ** r);
  return t;
})();
function It(t, r, o, a) {
  if (Ye(t), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (o <= 0 || o > 32)
    throw new Error(`convertRadix2: wrong to=${o}`);
  if (/* @__PURE__ */ Ge(r, o) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${o} carryBits=${/* @__PURE__ */ Ge(r, o)}`);
  let s = 0, n = 0;
  const l = nt[r], c = nt[o] - 1, d = [];
  for (const u of t) {
    if (Le(u), u >= l)
      throw new Error(`convertRadix2: invalid data word=${u} from=${r}`);
    if (s = s << r | u, n + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${n} from=${r}`);
    for (n += r; n >= o; n -= o)
      d.push((s >> n - o & c) >>> 0);
    const h = nt[n];
    if (h === void 0)
      throw new Error("invalid carry");
    s &= h - 1;
  }
  if (s = s << o - n & c, !a && n >= r)
    throw new Error("Excess padding");
  if (!a && s > 0)
    throw new Error(`Non-zero padding: ${s}`);
  return a && n > 0 && d.push(s >>> 0), d;
}
// @__NO_SIDE_EFFECTS__
function jo(t) {
  Le(t);
  const r = 2 ** 8;
  return {
    encode: (o) => {
      if (!He(o))
        throw new Error("radix.encode input should be Uint8Array");
      return Dt(Array.from(o), r, t);
    },
    decode: (o) => (ts("radix.decode", o), Uint8Array.from(Dt(o, t, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function zo(t, r = !1) {
  if (Le(t), t <= 0 || t > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Ge(8, t) > 32 || /* @__PURE__ */ Ge(t, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (o) => {
      if (!He(o))
        throw new Error("radix2.encode input should be Uint8Array");
      return It(Array.from(o), 8, t, !r);
    },
    decode: (o) => (ts("radix2.decode", o), Uint8Array.from(It(o, t, 8, r)))
  };
}
function Vo(t, r) {
  return Le(t), Uo(r), {
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
      for (let l = 0; l < t; l++)
        if (n[l] !== s[l])
          throw new Error("Invalid checksum");
      return a;
    }
  };
}
const _e = {
  alphabet: Wo,
  chain: _o,
  checksum: Vo,
  convertRadix: Dt,
  convertRadix2: It,
  radix: jo,
  radix2: zo,
  join: Oo,
  padding: qo
};
const Ho = (t) => t[0] === "あいこくしん";
function Qo(t) {
  if (typeof t != "string")
    throw new TypeError("invalid mnemonic type: " + typeof t);
  return t.normalize("NFKD");
}
function Yo(t) {
  const r = Qo(t), o = r.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: r, words: o };
}
function ss(t) {
  Bo(t, 16, 20, 24, 28, 32);
}
const Ko = (t) => {
  const r = 8 - t.length / 4;
  return new Uint8Array([Ro(t)[0] >> r << r]);
};
function os(t) {
  if (!Array.isArray(t) || t.length !== 2048 || typeof t[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return t.forEach((r) => {
    if (typeof r != "string")
      throw new Error("wordlist: non-string element: " + r);
  }), _e.chain(_e.checksum(1, Ko), _e.radix2(11, !0), _e.alphabet(t));
}
function Ot(t, r) {
  const { words: o } = Yo(t), a = os(r).decode(o);
  return ss(a), a;
}
function ns(t, r) {
  return ss(t), os(r).encode(t).join(Ho(r) ? "　" : " ");
}
function qt(t, r) {
  try {
    Ot(t, r);
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
`), ce = 12;
function Go(t) {
  if (t.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${t.length}`);
  const o = ns(t, ye).split(" ");
  if (o.length !== ce)
    throw new Error(`Unexpected word count: expected ${ce}, got ${o.length}`);
  return o;
}
function $o(t) {
  if (t.length !== ce)
    throw new Error(`Invalid word count: expected ${ce}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!qt(r, ye))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const o = Ot(r, ye);
  if (o.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${o.length}`);
  return ze(o);
}
function Jo(t) {
  if (t.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${t.length}`);
  const o = ns(t, ye).split(" ");
  if (o.length !== ce)
    throw new Error(`Unexpected word count: expected ${ce}, got ${o.length}`);
  return o;
}
function Xo(t) {
  if (t.length !== ce)
    throw new Error(`Invalid word count: expected ${ce}, got ${t.length}`);
  const r = t.join(" ").toLowerCase().trim();
  if (!qt(r, ye))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const o = Ot(r, ye);
  if (o.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${o.length}`);
  return _s(o);
}
function as(t) {
  if (t.length !== ce)
    return !1;
  const r = t.join(" ").toLowerCase().trim();
  return qt(r, ye);
}
function We(t) {
  return ye.includes(t.toLowerCase().trim());
}
function Zo(t, r = 5) {
  const o = t.toLowerCase().trim();
  return o.length === 0 ? [] : ye.filter((a) => a.startsWith(o)).slice(0, r);
}
function en(t) {
  const r = [];
  for (let o = 0; o < t.length; o += 4)
    r.push(t.slice(o, o + 4));
  return r;
}
function tn(t) {
  return t.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((r) => r.trim()).filter((r) => r.length > 0);
}
function oc({
  className: t = "",
  variant: r = "default",
  size: o = "md",
  children: a,
  menuItems: s = [],
  hideSignOut: n = !1
}) {
  const { user: l, isAuthenticated: c, isLoading: d, openLoginModal: u, logout: h } = Fr(), [f, g] = k(!1), [w, m] = k(-1), p = $(null), y = $(null), b = q(
    () => [...s, ...n ? [] : [{ label: "Sign out", onClick: h }]],
    [s, n, h]
  );
  _(() => {
    if (!f) return;
    const v = (x) => {
      p.current && !p.current.contains(x.target) && (g(!1), m(-1));
    }, C = (x) => {
      x.key === "Escape" && (g(!1), m(-1), y.current?.focus());
    };
    return document.addEventListener("mousedown", v), document.addEventListener("keydown", C), () => {
      document.removeEventListener("mousedown", v), document.removeEventListener("keydown", C);
    };
  }, [f]);
  const A = P(
    (v) => {
      if (!(!f || b.length === 0))
        switch (v.key) {
          case "ArrowDown":
            v.preventDefault(), m((C) => (C + 1) % b.length);
            break;
          case "ArrowUp":
            v.preventDefault(), m((C) => (C - 1 + b.length) % b.length);
            break;
          case "Home":
            v.preventDefault(), m(0);
            break;
          case "End":
            v.preventDefault(), m(b.length - 1);
            break;
          case "Enter":
          case " ":
            w >= 0 && (v.preventDefault(), b[w].onClick(), g(!1), m(-1));
            break;
        }
    },
    [f, w, b]
  ), N = P(() => {
    b.length !== 0 && (g((v) => !v), m(-1));
  }, [b.length]), E = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, L = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (d)
    return /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-button ${L[r]} ${E[o]} ${t}`,
        disabled: !0,
        children: /* @__PURE__ */ e(K, { size: "sm" })
      }
    );
  if (c && l) {
    const v = l.name || l.email || "User", C = Qr(l.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ i("div", { className: "cedros-user-menu", ref: p, onKeyDown: A, children: [
        /* @__PURE__ */ i(
          "button",
          {
            ref: y,
            type: "button",
            className: `cedros-button cedros-user-button ${E[o]} ${t}`,
            "aria-haspopup": "menu",
            "aria-expanded": f,
            "aria-label": `User menu for ${v}`,
            onClick: N,
            children: [
              C ? /* @__PURE__ */ e(
                "img",
                {
                  src: C,
                  alt: v,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ e("div", { className: "cedros-user-avatar-placeholder", children: (v[0] || "?").toUpperCase() }),
              /* @__PURE__ */ e("span", { className: "cedros-user-name", children: v })
            ]
          }
        ),
        f && /* @__PURE__ */ i("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          s.map((x, S) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${w === S ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: w === S ? 0 : -1,
              onClick: () => {
                x.onClick(), g(!1);
              },
              children: [
                x.icon && /* @__PURE__ */ e("span", { className: "cedros-dropdown-icon", children: x.icon }),
                x.label
              ]
            },
            S
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
                h(), g(!1);
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
      className: `cedros-button ${L[r]} ${E[o]} ${t}`,
      onClick: u,
      children: a || "Sign in"
    }
  );
}
function is() {
  const { config: t } = ne(), [r, o] = k(!1), [a, s] = k(!1), [n, l] = k(null), c = q(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), { checkLimit: d, getRemainingAttempts: u } = Ys({
    maxAttempts: 3,
    windowMs: 3e5
  }), h = P(
    async (m) => {
      if (!$s(m)) {
        const p = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(p), p;
      }
      try {
        d();
      } catch (p) {
        const y = {
          code: "RATE_LIMITED",
          message: p instanceof Error ? p.message : "Too many attempts"
        };
        throw l(y), y;
      }
      o(!0), l(null), s(!1);
      try {
        await c.post("/forgot-password", { email: m }), s(!0);
      } catch (p) {
        const y = O(p, "Failed to send reset email");
        throw l(y), y;
      } finally {
        o(!1);
      }
    },
    [c, d]
  ), f = P(
    async (m, p) => {
      o(!0), l(null), s(!1);
      try {
        await c.post("/reset-password", { token: m, newPassword: p }), s(!0);
      } catch (y) {
        const b = O(y, "Failed to reset password");
        throw l(b), b;
      } finally {
        o(!1);
      }
    },
    [c]
  ), g = P(() => l(null), []), w = P(() => {
    l(null), s(!1), o(!1);
  }, []);
  return {
    forgotPassword: h,
    resetPassword: f,
    isLoading: r,
    isSuccess: a,
    error: n,
    clearError: g,
    reset: w,
    remainingAttempts: u()
  };
}
function rn({
  onSuccess: t,
  onCancel: r,
  className: o = ""
}) {
  const [a, s] = k(""), { forgotPassword: n, isLoading: l, isSuccess: c, error: d, clearError: u } = is(), h = Vr(), f = async (g) => {
    g.preventDefault();
    try {
      await n(a), t?.();
    } catch {
    }
  };
  return c ? /* @__PURE__ */ i("div", { className: `cedros-forgot-password-success ${o}`, children: [
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
      /* @__PURE__ */ e("label", { htmlFor: h, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: h,
          type: "email",
          className: "cedros-input",
          value: a,
          onChange: (g) => s(g.target.value),
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
          children: l ? /* @__PURE__ */ i(X, { children: [
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
          disabled: l,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const sn = {
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
function on() {
  const { config: t, _internal: r } = ne(), [o, a] = k(!1), [s, n] = k(!1), [l, c] = k(null), [d, u] = k(null), h = $(t), f = q(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  );
  _(() => {
    h.current = t;
  }, [t]), _(() => {
    if (!t.appleClientId)
      return;
    let p = !0;
    const y = () => {
      if (p)
        try {
          window.AppleID?.auth?.init({
            clientId: t.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), p && n(!0);
        } catch {
          p && c({
            code: "SERVER_ERROR",
            message: "Failed to initialize Apple Sign In"
          });
        }
    };
    return sn.load().then(() => {
      p && y();
    }).catch(() => {
      p && c({
        code: "SERVER_ERROR",
        message: "Failed to load Apple Sign In"
      });
    }), () => {
      p = !1;
    };
  }, [t.appleClientId]);
  const g = P(async () => {
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
        message: "Apple Sign In not initialized"
      };
      throw c(y), y;
    }
    a(!0), c(null);
    let p;
    try {
      const y = await window.AppleID.auth.signIn();
      if (p = y.authorization?.id_token, !p)
        throw new Error("No ID token received from Apple");
      const b = y.user?.name ? `${y.user.name.firstName || ""} ${y.user.name.lastName || ""}`.trim() : void 0, A = await f.post("/apple", {
        idToken: p,
        name: b || void 0
      });
      return h.current.callbacks?.onLoginSuccess?.(A.user, "apple"), r?.handleLoginSuccess(A.user, A.tokens), a(!1), A;
    } catch (y) {
      if (y.error === "popup_closed_by_user") {
        const N = {
          code: "SERVER_ERROR",
          message: "Apple Sign In was cancelled"
        };
        throw c(N), a(!1), N;
      }
      const A = O(y, "Apple sign-in failed");
      throw A.code === "ACCOUNT_LINK_REQUIRED" && p && u(p), c(A), a(!1), A;
    }
  }, [t.appleClientId, s, f, r]), w = P(() => c(null), []), m = P(() => u(null), []);
  return {
    signIn: g,
    isLoading: o,
    isInitialized: s,
    error: l,
    clearError: w,
    pendingLinkIdToken: d,
    clearPendingLink: m
  };
}
function cs() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const t = navigator.userAgent.toLowerCase(), r = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(t) || r.includes("mac") || /macintosh/.test(t) || r === "macintel" && navigator.maxTouchPoints > 1);
}
function nn({
  onSuccess: t,
  onError: r,
  className: o = "",
  variant: a = "default",
  size: s = "md",
  disabled: n = !1,
  hideOnNonApple: l = !0
}) {
  const { signIn: c, isLoading: d, isInitialized: u } = on(), [h] = k(() => cs());
  if (l && !h)
    return null;
  const f = async () => {
    try {
      await c(), t?.();
    } catch (m) {
      const p = m instanceof Error ? m : new Error(String(m));
      r?.(p);
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
function an(t) {
  return t.replace(/-/g, "+").replace(/_/g, "/");
}
function $e(t) {
  se(typeof t == "string" && t.length > 0, "Expected base64url string");
  const r = an(t), o = r + "=".repeat((4 - r.length % 4) % 4), a = atob(o), s = new Uint8Array(a.length);
  for (let n = 0; n < a.length; n++) s[n] = a.charCodeAt(n);
  return s.buffer;
}
function Ce(t) {
  const r = new Uint8Array(t);
  let o = "";
  for (let s = 0; s < r.length; s++) o += String.fromCharCode(r[s]);
  return btoa(o).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ls(t) {
  se(typeof t == "object" && t !== null, "Invalid credential descriptor");
  const r = t;
  return se(typeof r.type == "string", "Invalid credential descriptor type"), se(typeof r.id == "string", "Invalid credential descriptor id"), {
    type: r.type,
    id: $e(r.id),
    transports: Array.isArray(r.transports) ? r.transports : void 0
  };
}
function Zt(t) {
  se(t && typeof t == "object", "Missing creation options");
  const r = t.publicKey;
  se(r && typeof r == "object", "Missing creation options.publicKey"), se(typeof r.challenge == "string", "Missing creation challenge"), se(typeof r.rp == "object" && r.rp !== null, "Missing rp"), se(typeof r.user == "object" && r.user !== null, "Missing user");
  const o = r.rp, a = r.user;
  se(typeof o.name == "string", "Missing rp.name"), se(typeof a.id == "string", "Missing user.id"), se(typeof a.name == "string", "Missing user.name"), se(typeof a.displayName == "string", "Missing user.displayName");
  const s = Array.isArray(r.excludeCredentials) ? r.excludeCredentials.map(ls) : void 0, n = Array.isArray(r.pubKeyCredParams) ? r.pubKeyCredParams.map((c) => ({
    type: c.type,
    alg: c.alg
  })) : [], l = {
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
  return l.hints = ["client-device"], l;
}
function cn(t) {
  se(t && typeof t == "object", "Missing request options");
  const r = t.publicKey;
  se(r && typeof r == "object", "Missing request options.publicKey"), se(typeof r.challenge == "string", "Missing request challenge");
  const o = Array.isArray(r.allowCredentials) ? r.allowCredentials.map(ls) : void 0, a = {
    challenge: $e(r.challenge),
    rpId: typeof r.rpId == "string" ? r.rpId : void 0,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    userVerification: typeof r.userVerification == "string" ? r.userVerification : void 0,
    allowCredentials: o,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
  return a.hints = ["client-device"], a;
}
function at(t) {
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
function ln() {
  if (typeof window < "u") {
    const t = window.location?.hostname, r = t === "localhost" || t === "127.0.0.1" || t?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !r)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function it(t) {
  if (!(t instanceof Error)) return null;
  const r = t.name;
  return r === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : r === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : r === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function dn() {
  const { config: t, _internal: r } = ne(), [o, a] = k(!1), [s, n] = k(null), l = q(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: r?.getAccessToken
    }),
    [r?.getAccessToken, t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), c = P(() => n(null), []), d = ln(), u = P(
    async (w) => {
      if (!d) {
        const m = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(m), m;
      }
      a(!0), n(null);
      try {
        const m = await l.post(
          "/webauthn/auth/options",
          { email: w?.email }
        ), p = cn(m.options), y = await navigator.credentials.get({
          publicKey: p
        });
        if (!y)
          throw new Error("Passkey authentication returned no credential");
        const b = await l.post("/webauthn/auth/verify", {
          challengeId: m.challengeId,
          credential: at(y)
        });
        return t.callbacks?.onLoginSuccess?.(b.user, "webauthn"), r?.handleLoginSuccess(b.user, b.tokens), b;
      } catch (m) {
        const y = it(m) ?? O(m, "Passkey sign-in failed");
        throw n(y), y;
      } finally {
        a(!1);
      }
    },
    [l, t.callbacks, r, d]
  ), h = P(
    async (w) => {
      if (!d) {
        const m = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(m), m;
      }
      a(!0), n(null);
      try {
        const m = await l.post(
          "/webauthn/register/options",
          {}
        ), p = Zt(m.options), y = await navigator.credentials.create({
          publicKey: p
        });
        if (!y)
          throw new Error("Passkey registration returned no credential");
        const b = await l.post("/webauthn/register/verify", {
          challengeId: m.challengeId,
          credential: at(y),
          label: w?.label
        });
        if (!b.success)
          throw new Error("Passkey registration failed");
        return { credentialId: b.credentialId, label: b.label };
      } catch (m) {
        const y = it(m) ?? O(m, "Passkey registration failed");
        throw n(y), y;
      } finally {
        a(!1);
      }
    },
    [l, d]
  ), f = P(
    async (w) => {
      if (!d) {
        const m = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw n(m), m;
      }
      a(!0), n(null);
      try {
        const m = await l.post(
          "/webauthn/signup/options",
          {}
        ), p = Zt(m.options), y = await navigator.credentials.create({
          publicKey: p
        });
        if (!y)
          throw new Error("Passkey signup returned no credential");
        const b = await l.post("/webauthn/signup/verify", {
          challengeId: m.challengeId,
          credential: at(y),
          email: w?.email,
          name: w?.name,
          label: w?.label
        });
        return t.callbacks?.onLoginSuccess?.(b.user, "webauthn"), r?.handleLoginSuccess(b.user, b.tokens), b;
      } catch (m) {
        const y = it(m) ?? O(m, "Passkey sign-up failed");
        throw n(y), y;
      } finally {
        a(!1);
      }
    },
    [l, t.callbacks, r, d]
  ), g = P(
    () => f(),
    [f]
  );
  return {
    isSupported: d,
    isLoading: o,
    error: s,
    clearError: c,
    continueWithPasskey: g,
    authenticatePasskey: u,
    registerPasskey: h,
    signupWithPasskey: f
  };
}
function un({
  onSuccess: t,
  className: r = "",
  children: o,
  disabled: a
}) {
  const { continueWithPasskey: s, isLoading: n, isSupported: l } = dn(), c = a || !l || n, d = n ? "Continuing..." : "Continue with Passkey";
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${r}`,
      onClick: async () => {
        await s(), t?.();
      },
      disabled: c,
      "aria-disabled": c,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ e(hn, {}) }),
        /* @__PURE__ */ e("span", { children: o ?? d })
      ]
    }
  );
}
function hn() {
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
const pn = [
  "phantom",
  "solflare",
  "backpack",
  "glow",
  "slope",
  "sollet",
  "coin98",
  "clover",
  "mathWallet",
  "ledger",
  "torus",
  "walletconnect"
];
function er(t) {
  if (!t || typeof t != "object") return !1;
  const r = t;
  return typeof r.connect == "function" || typeof r.signMessage == "function" || typeof r.signTransaction == "function" || "isConnected" in r;
}
function mn() {
  try {
    const t = window.__wallet_standard__;
    if (t && typeof t == "object" && "get" in t && typeof t.get == "function") {
      const r = t.get();
      return Array.isArray(r) && r.length > 0;
    }
  } catch {
  }
  return !1;
}
function tr() {
  if (typeof window > "u")
    return !1;
  const t = window;
  for (const r of pn) {
    const o = t[r];
    if (o && typeof o == "object" && "solana" in o && er(o.solana))
      return !0;
  }
  return !!(er(t.solana) || mn());
}
const Te = ["login", "register"];
function jt({ onSuccess: t, className: r = "", defaultTab: o = "login" }) {
  const { config: a } = ne(), [s, n] = k(o), [l, c] = k("form"), [d, u] = k(() => tr()), [h] = k(() => cs()), [f, g] = k(!1);
  _(() => {
    const v = () => u(tr());
    return v(), window.addEventListener("load", v), window.addEventListener("focus", v), () => {
      window.removeEventListener("load", v), window.removeEventListener("focus", v);
    };
  }, []);
  const w = a.forms?.forgotPassword?.mode ?? (a.features?.instantLink ? "instantLink" : "reset"), m = P(
    (v) => {
      const C = Te.indexOf(s);
      let x = C;
      switch (v.key) {
        case "ArrowLeft":
        case "ArrowUp":
          x = C === 0 ? Te.length - 1 : C - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          x = C === Te.length - 1 ? 0 : C + 1;
          break;
        case "Home":
          x = 0;
          break;
        case "End":
          x = Te.length - 1;
          break;
        default:
          return;
      }
      v.preventDefault();
      const S = Te[x];
      n(S), document.getElementById(`cedros-tab-${S}`)?.focus();
    },
    [s]
  ), p = a.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, y = p.email !== !1, b = p.google !== !1 && a.googleClientId, A = p.apple !== !1 && a.appleClientId && h, N = p.solana !== !1 && d, E = p.webauthn !== !1, L = y && (b || A || N || E);
  return l === "forgotPassword" ? /* @__PURE__ */ e("div", { className: `cedros-login-form ${r}`, children: /* @__PURE__ */ e(rn, { onCancel: () => c("form") }) }) : /* @__PURE__ */ i("div", { className: `cedros-login-form ${f ? "cedros-login-form--connecting" : ""} ${r}`, children: [
    (E || b || A || N) && /* @__PURE__ */ i("div", { className: "cedros-social-buttons", children: [
      E && /* @__PURE__ */ e(un, { onSuccess: t }),
      b && /* @__PURE__ */ e(Js, { onSuccess: t }),
      A && /* @__PURE__ */ e(nn, { onSuccess: t }),
      N && /* @__PURE__ */ i(X, { children: [
        /* @__PURE__ */ e(Xs, { onSuccess: t, onLoadingChange: g }),
        f && /* @__PURE__ */ e("p", { className: "cedros-solana-status", children: "Connecting to Solana wallet…" })
      ] })
    ] }),
    L && /* @__PURE__ */ e("div", { className: "cedros-divider", children: /* @__PURE__ */ e("span", { children: "Or continue with" }) }),
    y && /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${s === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => n("login"),
            onKeyDown: m,
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
            onKeyDown: m,
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
            Ks,
            {
              onSuccess: t,
              onSwitchToRegister: () => n("register"),
              onForgotPassword: w === "reset" ? () => c("forgotPassword") : void 0
            }
          ) : /* @__PURE__ */ e(
            Gs,
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
class fn extends Vs {
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
function nc({ className: t = "", title: r = "Sign in to your account" }) {
  const { isModalOpen: o, closeModal: a } = ne(), s = $(null), n = $(null), l = $(a);
  if (_(() => {
    l.current = a;
  }, [a]), _(() => {
    if (!o) return;
    n.current = document.activeElement, s.current?.focus();
    const d = (h) => {
      if (h.key === "Escape" && l.current(), h.key === "Tab" && s.current) {
        const f = s.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), g = f[0], w = f[f.length - 1];
        h.shiftKey && document.activeElement === g ? (h.preventDefault(), w?.focus()) : !h.shiftKey && document.activeElement === w && (h.preventDefault(), g?.focus());
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
            /* @__PURE__ */ e("div", { className: "cedros-modal-content", children: /* @__PURE__ */ e(fn, { children: /* @__PURE__ */ e(jt, { onSuccess: a }) }) })
          ]
        }
      )
    }
  );
}
function ac({
  token: t,
  onSuccess: r,
  onLoginClick: o,
  className: a = ""
}) {
  const [s, n] = k(""), [l, c] = k(""), [d, u] = k(null), { resetPassword: h, isLoading: f, isSuccess: g, error: w, clearError: m } = is(), p = s === l, y = d?.isValid && p && s.length > 0, b = async (A) => {
    if (A.preventDefault(), !!y)
      try {
        await h(t, s), r?.();
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
    /* @__PURE__ */ e(ee, { error: w, onDismiss: m }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      we,
      {
        label: "New password",
        value: s,
        onChange: (A) => {
          n(A.target.value), u(Wt(A.target.value));
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
        value: l,
        onChange: (A) => c(A.target.value),
        disabled: f,
        autoComplete: "new-password",
        error: l && !p ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: f || !y,
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
function Ft({ org: t, size: r = "lg", className: o = "" }) {
  const a = Qr(t.logoUrl), s = r === "lg" ? "cedros-org-avatar-lg" : "", n = ["cedros-org-avatar", s, o].filter(Boolean).join(" "), l = ["cedros-org-avatar-placeholder", s, o].filter(Boolean).join(" ");
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
function ic({
  orgs: t,
  activeOrg: r,
  isLoading: o = !1,
  onSelect: a,
  onCreateClick: s,
  className: n = "",
  placeholder: l = "Select organization"
}) {
  const [c, d] = k(!1), u = $(null);
  _(() => {
    const w = (m) => {
      u.current && !u.current.contains(m.target) && d(!1);
    };
    return document.addEventListener("mousedown", w), () => document.removeEventListener("mousedown", w);
  }, []), _(() => {
    const w = (m) => {
      m.key === "Escape" && d(!1);
    };
    if (c)
      return document.addEventListener("keydown", w), () => document.removeEventListener("keydown", w);
  }, [c]);
  const h = P(
    (w) => {
      a(w), d(!1);
    },
    [a]
  ), f = P(() => {
    d(!1), s?.();
  }, [s]), g = P(() => {
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
        onClick: g,
        "aria-haspopup": "listbox",
        "aria-expanded": c,
        children: [
          r ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(Ft, { org: r, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-name", children: r.name }),
            /* @__PURE__ */ e(rr, { role: r.membership.role })
          ] }) : /* @__PURE__ */ e("span", { className: "cedros-org-selector-placeholder", children: l }),
          /* @__PURE__ */ e(gn, { isOpen: c })
        ]
      }
    ),
    c && /* @__PURE__ */ i("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      t.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ e("ul", { className: "cedros-org-selector-list", children: t.map((w) => /* @__PURE__ */ e("li", { children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${w.id === r?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => h(w.id),
          role: "option",
          "aria-selected": w.id === r?.id,
          children: [
            /* @__PURE__ */ e(Ft, { org: w, size: "sm" }),
            /* @__PURE__ */ e("span", { className: "cedros-org-selector-item-name", children: w.name }),
            /* @__PURE__ */ e(rr, { role: w.membership.role }),
            w.id === r?.id && /* @__PURE__ */ e(wn, {})
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
              /* @__PURE__ */ e(yn, {}),
              /* @__PURE__ */ e("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function rr({ role: t }) {
  return /* @__PURE__ */ e("span", { className: `cedros-org-role cedros-org-role-${t}`, children: t });
}
function gn({ isOpen: t }) {
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
function wn() {
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
function yn() {
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
function bn() {
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
function An() {
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
function vn() {
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
function kn({
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
          /* @__PURE__ */ e(Ft, { org: n }),
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
          n.id === r?.id && /* @__PURE__ */ e(An, {})
        ]
      }
    ) }, n.id)) }),
    s && /* @__PURE__ */ i("button", { type: "button", className: "cedros-org-switcher-create", onClick: s, children: [
      /* @__PURE__ */ e(vn, {}),
      /* @__PURE__ */ e("span", { children: "Create new organization" })
    ] })
  ] });
}
function Nn({ isLoading: t, onSubmit: r, onCancel: o }) {
  const [a, s] = k(""), [n, l] = k(""), [c, d] = k(null), u = P((f) => {
    s(f);
    const g = f.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    l(g);
  }, []), h = P(
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
  return /* @__PURE__ */ i("form", { className: "cedros-org-create-form", onSubmit: h, children: [
    c && /* @__PURE__ */ e(ee, { error: c }),
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
          children: t ? /* @__PURE__ */ e(K, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function cc({
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
    Cn,
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
function Cn({
  onClose: t,
  orgs: r,
  activeOrg: o,
  isLoading: a = !1,
  error: s,
  onSelect: n,
  onCreate: l,
  className: c
}) {
  const [d, u] = k("list"), h = $(null), f = $(null);
  _(() => (f.current = document.activeElement, h.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    f.current?.focus();
  }), []), _(() => {
    const p = (y) => {
      if (y.key === "Escape") {
        t();
        return;
      }
      if (y.key === "Tab" && h.current) {
        const b = h.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), A = b[0], N = b[b.length - 1];
        y.shiftKey ? document.activeElement === A && (y.preventDefault(), N?.focus()) : document.activeElement === N && (y.preventDefault(), A?.focus());
      }
    };
    return document.addEventListener("keydown", p), () => document.removeEventListener("keydown", p);
  }, [t]);
  const g = P(
    (p) => {
      p.target === p.currentTarget && t();
    },
    [t]
  ), w = P(
    (p) => {
      n(p), t();
    },
    [n, t]
  ), m = P(
    async (p) => {
      await l?.(p), t();
    },
    [l, t]
  );
  return /* @__PURE__ */ e("div", { className: "cedros-modal-backdrop", onClick: g, children: /* @__PURE__ */ i(
    "div",
    {
      ref: h,
      className: `cedros-modal cedros-org-switcher ${c}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ e("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: d === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-modal-close", onClick: t, "aria-label": "Close", children: /* @__PURE__ */ e(bn, {}) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-modal-body", children: [
          s && /* @__PURE__ */ e(ee, { error: s }),
          d === "list" ? /* @__PURE__ */ e(
            kn,
            {
              orgs: r,
              activeOrg: o,
              isLoading: a,
              onSelect: w,
              onCreateClick: l ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ e(
            Nn,
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
function lc({
  sessions: t,
  isLoading: r = !1,
  error: o,
  onRevokeAll: a,
  className: s = ""
}) {
  const [n, l] = k(!1), [c, d] = k(!1), u = $(null), h = q(() => t.filter((g) => !g.isCurrent).length, [t]), f = P(async () => {
    if (!a) return;
    const g = t.filter((m) => !m.isCurrent).length;
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
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { children: "Loading sessions..." })
  ] }) : o ? /* @__PURE__ */ e("div", { className: `cedros-session-list ${s}`, children: /* @__PURE__ */ e(ee, { error: o }) }) : t.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-session-list cedros-session-list-empty ${s}`, children: /* @__PURE__ */ e("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-session-list ${s}`, children: [
    c && /* @__PURE__ */ i("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ e(Mn, {}),
      /* @__PURE__ */ e("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ e("ul", { className: "cedros-session-items", children: t.map((g) => /* @__PURE__ */ e(En, { session: g }, g.id)) }),
    a && h > 0 && /* @__PURE__ */ e("div", { className: "cedros-session-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: f,
        disabled: n,
        children: n ? /* @__PURE__ */ i(X, { children: [
          /* @__PURE__ */ e(K, { size: "sm" }),
          /* @__PURE__ */ e("span", { children: "Signing out..." })
        ] }) : `Sign out of ${h} other device${h > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function En({ session: t }) {
  const r = Sn(t.userAgent), o = Pn(t.expiresAt);
  return /* @__PURE__ */ i("li", { className: `cedros-session-item ${t.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ e(Ln, { userAgent: t.userAgent }) }),
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
          xn(t.createdAt)
        ] }),
        o && /* @__PURE__ */ e("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function Sn(t) {
  if (!t)
    return { browser: "Unknown browser", os: "Unknown device" };
  let r = "Unknown browser";
  t.includes("Chrome") && !t.includes("Edg") ? r = "Chrome" : t.includes("Safari") && !t.includes("Chrome") ? r = "Safari" : t.includes("Firefox") ? r = "Firefox" : t.includes("Edg") && (r = "Edge");
  let o = "Unknown device";
  return t.includes("Windows") ? o = "Windows" : t.includes("Mac") ? o = "macOS" : t.includes("Linux") ? o = "Linux" : t.includes("iPhone") || t.includes("iPad") ? o = "iOS" : t.includes("Android") && (o = "Android"), { browser: r, os: o };
}
function xn(t) {
  const r = new Date(t), a = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), s = Math.floor(a / (1e3 * 60)), n = Math.floor(a / (1e3 * 60 * 60)), l = Math.floor(a / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s} minute${s > 1 ? "s" : ""} ago` : n < 24 ? `${n} hour${n > 1 ? "s" : ""} ago` : l < 7 ? `${l} day${l > 1 ? "s" : ""} ago` : r.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Pn(t) {
  const r = new Date(t), o = /* @__PURE__ */ new Date(), a = 3600 * 1e3;
  return r.getTime() - o.getTime() < a;
}
function Ln({ userAgent: t }) {
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
function Mn() {
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
function Tn({
  words: t,
  onConfirm: r,
  className: o = ""
}) {
  const [a, s] = k(!1), [n, l] = k(!1), c = $(null), d = en(t), u = P(async () => {
    try {
      await navigator.clipboard.writeText(t.join(" ")), s(!0), c.current !== null && window.clearTimeout(c.current), c.current = window.setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [t]);
  _(() => () => {
    c.current !== null && (window.clearTimeout(c.current), c.current = null);
  }, []);
  const h = P(() => {
    n && r();
  }, [n, r]);
  return /* @__PURE__ */ i("div", { className: `cedros-recovery-phrase-display ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ e("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-recovery-grid", children: d.map((f, g) => /* @__PURE__ */ e("div", { className: "cedros-word-group", children: f.map((w, m) => {
      const p = g * 4 + m + 1;
      return /* @__PURE__ */ i("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ i("span", { className: "cedros-word-number", children: [
          p,
          "."
        ] }),
        /* @__PURE__ */ e("span", { className: "cedros-word-text", children: w })
      ] }, p);
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
          onClick: h,
          disabled: !n,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function Bn({
  onSubmit: t,
  onCancel: r,
  isSubmitting: o = !1,
  error: a,
  className: s = ""
}) {
  const [n, l] = k(Array(ce).fill("")), [c, d] = k(null), [u, h] = k([]), [f, g] = k(null), w = Vr(), m = $(null), p = P(
    (v, C) => {
      const x = [...n];
      if (x[v] = C.toLowerCase().trim(), l(x), C.length > 0) {
        const S = Zo(C, 5);
        h(S);
      } else
        h([]);
      g(null);
    },
    [n]
  ), y = P((v) => {
    d(v), h([]);
  }, []), b = P(
    (v) => {
      const C = n[v];
      C && !We(C) && g(`Word ${v + 1} is not in the wordlist`), m.current !== null && window.clearTimeout(m.current), m.current = window.setTimeout(() => {
        c === v && h([]);
      }, 200);
    },
    [n, c]
  );
  _(() => () => {
    m.current !== null && (window.clearTimeout(m.current), m.current = null);
  }, []);
  const A = P(
    (v) => {
      if (c !== null) {
        const C = [...n];
        C[c] = v, l(C), h([]), document.querySelector(
          `[data-word-index="${c + 1}"]`
        )?.focus();
      }
    },
    [c, n]
  ), N = P((v) => {
    const C = v.clipboardData.getData("text"), x = tn(C);
    x.length === ce && (v.preventDefault(), l(x), g(null));
  }, []), E = P(
    (v) => {
      if (v.preventDefault(), n.filter((S) => !S).length > 0) {
        g(`Please enter all ${ce} words`);
        return;
      }
      const x = n.map((S, B) => ({ word: S, index: B + 1 })).filter(({ word: S }) => !We(S));
      if (x.length > 0) {
        g(`Invalid words: ${x.map((S) => `#${S.index}`).join(", ")}`);
        return;
      }
      if (!as(n)) {
        g("Invalid recovery phrase - please check your words");
        return;
      }
      t(n);
    },
    [n, t]
  ), L = a || f;
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
        /* @__PURE__ */ e("div", { className: "cedros-word-inputs", children: Array.from({ length: ce }, (v, C) => /* @__PURE__ */ i("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ i("label", { className: "cedros-word-label", children: [
            C + 1,
            "."
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${n[C] && !We(n[C]) ? "cedros-word-invalid" : n[C] && We(n[C]) ? "cedros-word-valid" : ""}`,
              value: n[C],
              onChange: (x) => p(C, x.target.value),
              onFocus: () => y(C),
              onBlur: () => b(C),
              "data-word-index": C,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: o,
              "aria-label": `Word ${C + 1}`
            }
          )
        ] }, C)) }),
        c !== null && u.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-suggestions", role: "listbox", id: `${w}-suggestions`, children: u.map((v) => /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => A(v),
            role: "option",
            children: v
          },
          v
        )) }),
        L && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: L }),
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
function dc({ capabilities: t, className: r = "" }) {
  if (t.allSupported)
    return null;
  const o = Ws(t), a = Os();
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
const Rn = ["share_c_only", "full_seed", "none"];
function Dn(t) {
  return t && Rn.includes(t) ? t : "share_c_only";
}
const In = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function ds() {
  const t = ve(), [r, o] = k(null), [a, s] = k(!!t), [n, l] = k(null), c = q(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts
  }) : null, [t]), d = P(async () => {
    if (c) {
      s(!0), l(null);
      try {
        const u = await c.get("/discovery");
        u.wallet ? o({
          enabled: u.wallet.enabled,
          recoveryMode: Dn(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : o({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const h = u instanceof Error ? u.message : "Failed to fetch wallet config";
        l(h), o({
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
  } : In;
}
function Fn() {
  const { user: t } = ne(), { enroll: r } = Pe(), { recoveryMode: o } = ds(), [a, s] = k({ step: "idle" }), [n, l] = k(!1), c = $([]), d = P(() => {
    Ur(...c.current), c.current = [];
  }, []);
  _(() => () => {
    d();
  }, [d]);
  const u = P(
    async (m, p, y, b) => {
      s({ step: "generating_seed" });
      const A = qs();
      c.current.push(A), s({ step: "splitting_shares" });
      const { shareA: N, shareB: E, shareC: L } = $r(A);
      c.current.push(N, E, L), s({ step: "encrypting_shares" });
      const v = await _r(N, Wr(p)), C = Jr(A), x = Xr(C);
      s({ step: "uploading" });
      const S = {
        solanaPubkey: x,
        shareAAuthMethod: m,
        shareACiphertext: v.ciphertext,
        shareANonce: v.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: ge(E)
      };
      if (m === "password") {
        if (!y) throw new Error("KDF salt required for password method");
        S.shareAKdfSalt = ge(y), S.shareAKdfParams = Ve;
      }
      if (m === "passkey" && b && (S.prfSalt = b), await r(S), o === "none")
        d(), s({
          step: "complete",
          solanaPubkey: x
        });
      else {
        const B = o === "full_seed" ? Jo(A) : Go(ze(L));
        s({
          step: "showing_recovery",
          recoveryPhrase: B,
          solanaPubkey: x
        });
      }
    },
    [r, o, d]
  ), h = P(
    async (m) => {
      if (!t) {
        s({ step: "error", error: "User not authenticated" });
        return;
      }
      l(!0), d();
      try {
        const p = Or(), y = await Zr(m, p, Ve);
        c.current.push(y), await u("password", y, p);
      } catch (p) {
        s({
          step: "error",
          error: p instanceof Error ? p.message : "Enrollment failed"
        });
      } finally {
        l(!1);
      }
    },
    [t, d, u]
  ), f = P(async () => {
    if (!t) {
      s({ step: "error", error: "User not authenticated" });
      return;
    }
    l(!0), d();
    try {
      const m = qr(), p = ge(m);
      s({ step: "registering_passkey" });
      let y;
      try {
        const A = new TextEncoder().encode(t.id), N = t.name ?? t.email ?? "User", E = t.email ?? t.id;
        y = (await js(
          A,
          E,
          N,
          m
        )).prfOutput;
      } catch (A) {
        if (A?.name !== "InvalidStateError")
          throw A;
        y = (await _t(p)).prfOutput;
      }
      c.current.push(y);
      const b = await jr(y, m);
      c.current.push(b), await u("passkey", b, void 0, p);
    } catch (m) {
      s({
        step: "error",
        error: m instanceof Error ? m.message : "Enrollment failed"
      });
    } finally {
      l(!1);
    }
  }, [t, d, u]), g = P(() => {
    const m = a.solanaPubkey;
    d(), s({
      step: "complete",
      solanaPubkey: m
    });
  }, [a.solanaPubkey, d]), w = P(() => {
    d(), s({ step: "idle" }), l(!1);
  }, [d]);
  return {
    state: a,
    startEnrollmentWithPassword: h,
    startEnrollmentWithPasskey: f,
    confirmRecoveryPhrase: g,
    cancel: w,
    isEnrolling: n
  };
}
function Un({
  onComplete: t,
  onCancel: r,
  className: o = "",
  forceAuthMethod: a
}) {
  const { user: s } = ne(), {
    state: n,
    startEnrollmentWithPassword: l,
    startEnrollmentWithPasskey: c,
    confirmRecoveryPhrase: d,
    cancel: u,
    isEnrolling: h
  } = Fn(), f = () => a || "password", [g, w] = k(f), [m, p] = k(""), [y, b] = k(""), [A, N] = k(null);
  _(() => {
    w(f());
  }, [s?.id, a]);
  const E = P(
    async (x) => {
      if (x.preventDefault(), m !== y) {
        N("Passwords do not match");
        return;
      }
      const S = Wt(m);
      if (!S.isValid) {
        const B = Object.values(S.errors)[0];
        N(B ?? "Password does not meet requirements");
        return;
      }
      N(null), await l(m);
    },
    [m, y, l]
  ), L = P(async () => {
    await c();
  }, [c]), v = P(() => {
    d(), n.solanaPubkey && t?.(n.solanaPubkey);
  }, [d, n.solanaPubkey, t]), C = P(() => {
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
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ e(Tn, { words: n.recoveryPhrase, onConfirm: v }) }) : n.step === "complete" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-enrollment ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-complete", children: [
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
          onClick: C,
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
            disabled: h
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
            disabled: h
          }
        ),
        /* @__PURE__ */ e("span", { children: "Passkey" })
      ] })
    ] }),
    g === "password" && /* @__PURE__ */ i("form", { onSubmit: E, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ e(
        we,
        {
          label: "Password",
          value: m,
          onChange: (x) => p(x.target.value),
          showStrengthMeter: !0,
          disabled: h,
          required: !0,
          minLength: 8,
          placeholder: "Enter a strong password"
        }
      ),
      /* @__PURE__ */ e(
        we,
        {
          label: "Confirm Password",
          value: y,
          onChange: (x) => b(x.target.value),
          error: A ?? void 0,
          disabled: h,
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
            onClick: C,
            disabled: h,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: h || !m || !y,
            children: h ? "Creating..." : "Continue"
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
            onClick: C,
            disabled: h,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: L,
            disabled: h,
            children: h ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] })
  ] });
}
function _n() {
  const { user: t } = ne(), { signTransaction: r } = Pe(), [o, a] = k(!1), [s, n] = k(null), l = P(
    async (d, u) => {
      if (!t) {
        const h = "User not authenticated";
        throw n(h), new Error(h);
      }
      a(!0), n(null);
      try {
        const h = {
          transaction: ge(d),
          ...u ? { credential: zs(u) } : {}
        }, f = await r(h);
        return zr(f.signature);
      } catch (h) {
        const f = h instanceof Error ? h.message : "Signing failed";
        throw n(f), h;
      } finally {
        a(!1);
      }
    },
    [t, r]
  ), c = P(() => n(null), []);
  return {
    signTransaction: l,
    isSigning: o,
    error: s,
    clearError: c
  };
}
function Wn() {
  const { getMaterial: t } = Pe(), [r, o] = k(!1), [a, s] = k(null), n = P(async () => {
    o(!0), s(null);
    try {
      const c = await t();
      if (!c)
        throw new Error("No wallet enrolled");
      if (c.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!c.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const d = await _t(c.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: ge(d.prfOutput)
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
  }, [t]), l = P(() => s(null), []);
  return {
    getPasskeyCredential: n,
    isAuthenticating: r,
    error: a,
    clearError: l
  };
}
function On({
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
  const u = P(() => {
    r || a?.();
  }, [r, a]), h = P(() => {
    s?.();
  }, [s]), f = t === "register" ? "Set Up Passkey" : "Verify with Passkey", g = t === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ i("div", { className: `cedros-passkey-prompt ${d}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-passkey-icon", children: r ? /* @__PURE__ */ e(jn, {}) : o ? /* @__PURE__ */ e(zn, {}) : /* @__PURE__ */ e(qn, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-passkey-title", children: l ?? f }),
    /* @__PURE__ */ e("p", { className: "cedros-passkey-description", children: c ?? g }),
    o && /* @__PURE__ */ e("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ e("p", { children: o }) }),
    /* @__PURE__ */ e("div", { className: "cedros-passkey-actions", children: o ? /* @__PURE__ */ i(X, { children: [
      s && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: h,
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
function qn() {
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
function jn() {
  return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ e("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function zn() {
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
function Vn({
  onUnlock: t,
  onCancel: r,
  showCancel: o = !0,
  authMethod: a,
  className: s = ""
}) {
  ne();
  const { unlock: n, getMaterial: l, isLoading: c } = Pe(), { getPasskeyCredential: d, isAuthenticating: u } = Wn(), [h, f] = k("idle"), [g, w] = k(a ?? null), [m, p] = k(""), [y, b] = k(null);
  _(() => {
    a !== void 0 && w(a);
  }, [a]);
  const A = g === "password", N = g === "passkey", E = P(async () => {
    if (f("credential"), b(null), !g)
      try {
        const T = await l();
        T ? w(T.shareAAuthMethod) : (b("No wallet enrolled"), f("error"));
      } catch (T) {
        b(T instanceof Error ? T.message : "Failed to get wallet info"), f("error");
      }
  }, [g, l]), L = P(
    async (T) => {
      T.preventDefault(), b(null), f("unlocking");
      try {
        let M;
        if (A)
          M = { type: "password", password: m };
        else
          throw new Error("Invalid auth method");
        await n(M), f("unlocked"), t?.();
      } catch (M) {
        b(M instanceof Error ? M.message : "Failed to unlock wallet"), f("error");
      }
    },
    [A, m, n, t]
  ), v = P(async () => {
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
  }, [d, n, t]), C = P(() => {
    p(""), f("idle"), b(null), r?.();
  }, [r]), x = P(() => {
    p(""), f("credential"), b(null);
  }, []), S = c || u, B = () => {
    switch (h) {
      case "idle":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Hn, {}) }),
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
        return A ? /* @__PURE__ */ i("form", { className: "cedros-wallet-unlock-form", onSubmit: L, children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ e(
            we,
            {
              label: "Password",
              value: m,
              onChange: (T) => p(T.target.value),
              disabled: S,
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
                disabled: S || m.length === 0,
                children: S ? "Unlocking..." : "Unlock"
              }
            ),
            o && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: C,
                disabled: S,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ e(
            On,
            {
              mode: "authenticate",
              isLoading: S,
              error: y ?? void 0,
              onPrompt: v,
              onRetry: v,
              onCancel: o ? C : void 0
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
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Qn, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ e("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ e(Yn, {}) }),
          /* @__PURE__ */ e("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ e("p", { className: "cedros-wallet-unlock-description", children: y ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: x,
                children: "Try Again"
              }
            ),
            o && /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: C,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ e("div", { className: `cedros-wallet-unlock ${s}`, children: B() });
}
function Hn() {
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
function Qn() {
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
function Yn() {
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
function Kn() {
  const { recover: t, getShareBForRecovery: r } = Pe(), { recoveryMode: o } = ds(), [a, s] = k({ step: "idle" }), [n, l] = k(!1), c = $([]), d = P(() => {
    Ur(...c.current), c.current = [];
  }, []);
  _(() => () => {
    d();
  }, [d]);
  const u = P(
    async (f, g, w) => {
      l(!0), d();
      try {
        if (s({ step: "validating" }), !as(f))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let m;
        if (o === "share_c_only") {
          const x = $o(f);
          c.current.push(x);
          const S = ge(x), B = await r({ shareC: S }), T = zr(B.shareB);
          c.current.push(T), m = Do(ze(T), ze(x)), c.current.push(m);
        } else
          m = Xo(f), c.current.push(m);
        const p = Jr(m), y = Xr(p), { shareA: b, shareB: A } = $r(m);
        c.current.push(b, A), s({ step: "encrypting" });
        let N, E, L;
        if (g === "passkey") {
          const x = qr();
          L = ge(x);
          const S = await _t(L);
          c.current.push(S.prfOutput), N = await jr(S.prfOutput, x), c.current.push(N);
        } else
          E = Or(), N = await Zr(w, E, Ve), c.current.push(N);
        const v = await _r(b, Wr(N));
        s({ step: "uploading" });
        const C = {
          solanaPubkey: y,
          shareAAuthMethod: g,
          shareACiphertext: v.ciphertext,
          shareANonce: v.nonce,
          shareB: ge(A)
        };
        g === "password" && (C.shareAKdfSalt = ge(E), C.shareAKdfParams = Ve), g === "passkey" && (C.prfSalt = L), await t(C), d(), s({ step: "complete" });
      } catch (m) {
        d(), s({
          step: "error",
          error: m instanceof Error ? m.message : "Recovery failed"
        });
      } finally {
        l(!1);
      }
    },
    [t, r, o, d]
  ), h = P(() => {
    d(), s({ step: "idle" }), l(!1);
  }, [d]);
  return {
    state: a,
    startRecovery: u,
    cancel: h,
    isRecovering: n
  };
}
function Gn({
  onComplete: t,
  onCancel: r,
  className: o = "",
  defaultAuthMethod: a = "password"
}) {
  const { state: s, startRecovery: n, cancel: l, isRecovering: c } = Kn(), [d, u] = k([]), [h, f] = k(!1), [g, w] = k(a), [m, p] = k(""), [y, b] = k(""), [A, N] = k(null), E = P((S) => {
    u(S), f(!0);
  }, []), L = P(
    async (S) => {
      if (S.preventDefault(), N(null), g !== "passkey") {
        if (m !== y) {
          N("Passwords do not match");
          return;
        }
        if (g === "password" && m.length < 8) {
          N("Password must be at least 8 characters");
          return;
        }
      }
      await n(d, g, m);
    },
    [d, g, m, y, n]
  ), v = P(() => {
    l(), u([]), f(!1), p(""), b(""), r?.();
  }, [l, r]), C = P(() => {
    f(!1), p(""), b("");
  }, []), x = P(() => {
    t?.();
  }, [t]);
  return s.step === "validating" || s.step === "encrypting" || s.step === "uploading" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e($n, {}) }),
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
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(Jn, {}) }),
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
        onClick: x,
        children: "Done"
      }
    ) })
  ] }) }) : s.step === "error" ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ e(Xn, {}) }),
    /* @__PURE__ */ e("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ e("p", { className: "cedros-wallet-recovery-description", children: s.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ e("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: v,
        children: "Start Over"
      }
    ) })
  ] }) }) : h ? /* @__PURE__ */ e("div", { className: `cedros-wallet-recovery ${o}`, children: /* @__PURE__ */ i("form", { className: "cedros-wallet-recovery-credential", onSubmit: L, children: [
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
    g === "password" && /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ e("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: m,
            onChange: (S) => p(S.target.value),
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
            onChange: (S) => b(S.target.value),
            disabled: c,
            "aria-invalid": A ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        A && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: A })
      ] })
    ] }),
    g === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ e(Zn, {}),
      /* @__PURE__ */ e("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: C,
          disabled: c,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: c || g !== "passkey" && (m.length === 0 || y.length === 0),
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
      Bn,
      {
        onSubmit: E,
        onCancel: v,
        isSubmitting: !1
      }
    )
  ] }) });
}
function $n() {
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
function Jn() {
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
function Xn() {
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
function Zn() {
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
function ea({
  address: t,
  label: r = "Wallet Address",
  showCopy: o = !0,
  showExplorerLink: a = !0,
  allowReveal: s = !0,
  className: n = ""
}) {
  const l = ve(), [c, d] = k(!1), [u, h] = k(null), [f, g] = k(!1), w = $(null), m = l?.config.solana?.network ?? "mainnet-beta", p = q(() => {
    const N = `https://explorer.solana.com/address/${t}`;
    return m === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(m)}`;
  }, [t, m]), y = s && t.length > 18, b = q(() => !y || f ? t : `${t.slice(0, 8)}...${t.slice(-8)}`, [t, y, f]), A = P(async () => {
    try {
      h(null), await navigator.clipboard.writeText(t), d(!0), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        d(!1), w.current = null;
      }, 2e3);
    } catch (N) {
      d(!1), h(N instanceof Error ? N.message : "Copy failed");
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
            href: p,
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
            onClick: A,
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
function ta({
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
  const u = t !== void 0, h = Xe(), f = u ? t : h.status, g = u ? r ?? null : h.solanaPubkey, w = u ? null : h.error, m = u ? () => {
  } : h.refresh, p = u ? () => {
  } : h.clearError, y = ra(f, w);
  return c ? /* @__PURE__ */ i("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${d}`, children: [
    /* @__PURE__ */ e(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${y.color}`,
        title: y.label
      }
    ),
    /* @__PURE__ */ e("span", { className: "cedros-wallet-status-label", children: y.label }),
    g && /* @__PURE__ */ e("span", { className: "cedros-wallet-status-pubkey", title: g, children: sa(g) })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-status ${d}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ e(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${y.color}`,
          children: /* @__PURE__ */ e(oa, { status: f })
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ e("h4", { className: "cedros-wallet-status-title", children: y.title }),
        /* @__PURE__ */ e("p", { className: "cedros-wallet-status-description", children: y.description })
      ] })
    ] }),
    g && /* @__PURE__ */ e("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ e(ea, { address: g }) }),
    w && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ e("p", { children: w }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: p,
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
          onClick: m,
          children: "Retry"
        }
      )
    ] })
  ] });
}
function ra(t, r) {
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
function sa(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function oa({ status: t }) {
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
function uc({ className: t = "", showActions: r = !0 }) {
  const o = Xe(), [a, s] = k("status"), n = q(() => {
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
  }, [a]), l = P(() => s("status"), []), c = P(async () => {
    s("status"), await o.refresh();
  }, [o]), d = P(async () => {
    s("status"), await o.refresh();
  }, [o]), u = P(async () => {
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
      ta,
      {
        onEnroll: () => s("enroll"),
        onUnlock: () => s("unlock"),
        onRecover: () => s("recover_intro"),
        showActions: r
      }
    ),
    a === "enroll" && /* @__PURE__ */ e(
      Un,
      {
        onComplete: () => {
          c();
        },
        onCancel: l
      }
    ),
    a === "unlock" && /* @__PURE__ */ e(
      Vn,
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
      Gn,
      {
        onComplete: () => {
          u();
        },
        onCancel: l
      }
    )
  ] });
}
function hc({
  showDescriptions: t = !0,
  className: r = "",
  onSave: o
}) {
  const { settings: a, isLoading: s, isUpdating: n, error: l, fetchSettings: c, updateSettings: d } = io(), [u, h] = k({}), [f, g] = k(null), [w, m] = k(!1);
  _(() => {
    c();
  }, [c]), _(() => {
    if (w) {
      const L = setTimeout(() => m(!1), 3e3);
      return () => clearTimeout(L);
    }
  }, [w]);
  const p = P((L, v) => {
    h((C) => ({ ...C, [L]: v })), g(null), m(!1);
  }, []), y = P(async () => {
    const L = Object.entries(u).map(([v, C]) => ({
      key: v,
      value: C
    }));
    if (L.length !== 0)
      try {
        await d(L), h({}), g(null), m(!0), o?.();
      } catch (v) {
        g(v instanceof Error ? v.message : "Failed to save settings");
      }
  }, [u, d, o]), b = P(() => {
    h({}), g(null), m(!1);
  }, []), A = Object.keys(u).length > 0, N = Object.keys(u).length;
  if (s && Object.keys(a).length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
      /* @__PURE__ */ e(K, {}),
      /* @__PURE__ */ e("span", { children: "Loading settings..." })
    ] });
  if (l)
    return /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ e(ee, { error: l.message }) });
  const E = Object.keys(a).sort();
  return E.length === 0 ? /* @__PURE__ */ e("div", { className: `cedros-system-settings cedros-system-settings-empty ${r}`, children: /* @__PURE__ */ e("p", { children: "No system settings found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${r}`, children: [
    f && /* @__PURE__ */ e(ee, { error: f }),
    w && /* @__PURE__ */ e("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    E.map((L) => /* @__PURE__ */ e(
      na,
      {
        category: L,
        settings: a[L],
        edits: u,
        showDescription: t,
        onChange: p
      },
      L
    )),
    /* @__PURE__ */ i("div", { className: "cedros-system-settings-actions", children: [
      A && /* @__PURE__ */ i("span", { className: "cedros-settings-change-count", children: [
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
          disabled: !A || n,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: y,
          disabled: !A || n,
          children: n ? /* @__PURE__ */ e(K, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const sr = Object.keys(lo);
function na({
  category: t,
  settings: r,
  edits: o,
  showDescription: a,
  onChange: s
}) {
  const n = co[t] || {
    label: t,
    description: "",
    icon: ""
  }, l = q(() => [...r].sort((c, d) => {
    const u = sr.indexOf(c.key), h = sr.indexOf(d.key);
    return (u === -1 ? 1 / 0 : u) - (h === -1 ? 1 / 0 : h);
  }), [r]);
  return /* @__PURE__ */ i("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ e("span", { className: "cedros-settings-section-icon", children: n.icon }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("h3", { className: "cedros-settings-section-title", children: n.label }),
        a && n.description && /* @__PURE__ */ e("p", { className: "cedros-settings-section-description", children: n.description })
      ] })
    ] }),
    /* @__PURE__ */ e(Kr, { settings: l, edits: o, onChange: s })
  ] });
}
class aa {
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
      throw O(r, "Failed to check setup status");
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
      throw O(o, "Failed to create admin account");
    }
  }
}
function us() {
  const { config: t } = ne(), [r, o] = k(null), [a, s] = k(!1), [n, l] = k(!1), [c, d] = k(null), u = $(0), h = q(
    () => new aa(t.serverUrl, t.requestTimeout, t.retryAttempts),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), f = $(h);
  f.current = h;
  const g = P(async () => {
    s(!0), d(null);
    const m = ++u.current;
    try {
      const p = await f.current.getStatus();
      if (m !== u.current) return;
      o(p);
    } catch (p) {
      if (m !== u.current) return;
      d(p instanceof Error ? p : new Error("Failed to check setup status"));
    } finally {
      m === u.current && s(!1);
    }
  }, []), w = P(
    async (m) => {
      l(!0), d(null);
      try {
        const p = await f.current.createFirstAdmin(m);
        return await g(), p;
      } catch (p) {
        const y = p instanceof Error ? p : new Error("Failed to create admin");
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
const ia = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, or = 8;
function ca(t) {
  const r = {};
  return t.email ? ia.test(t.email) || (r.email = "Invalid email format") : r.email = "Email is required", t.password ? t.password.length < or && (r.password = `Password must be at least ${or} characters`) : r.password = "Password is required", t.confirmPassword ? t.password !== t.confirmPassword && (r.confirmPassword = "Passwords do not match") : r.confirmPassword = "Please confirm your password", r;
}
function la({ onComplete: t, className: r = "" }) {
  const { status: o, isLoading: a, isCreating: s, error: n, checkStatus: l, createAdmin: c } = us(), [d, u] = k({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [h, f] = k({}), [g, w] = k(!1);
  _(() => {
    l();
  }, [l]);
  const m = P(
    (y) => (b) => {
      u((A) => ({ ...A, [y]: b.target.value })), f((A) => ({ ...A, [y]: void 0 }));
    },
    []
  ), p = P(
    async (y) => {
      y.preventDefault();
      const b = ca(d);
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
    /* @__PURE__ */ i("form", { className: "cedros-setup__form", onSubmit: p, children: [
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
            className: `cedros-setup__input ${h.email ? "cedros-setup__input--error" : ""}`,
            value: d.email,
            onChange: m("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: s
          }
        ),
        h.email && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: h.email })
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
            onChange: m("name"),
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
            onChange: m("orgName"),
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
            className: `cedros-setup__input ${h.password ? "cedros-setup__input--error" : ""}`,
            value: d.password,
            onChange: m("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        h.password && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: h.password })
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
            className: `cedros-setup__input ${h.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: d.confirmPassword,
            onChange: m("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        h.confirmPassword && /* @__PURE__ */ e("span", { className: "cedros-setup__error", children: h.confirmPassword })
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
const da = ["security", "rate_limit"];
function pc({ className: t }) {
  return /* @__PURE__ */ e(
    Fo,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: da,
      className: t
    }
  );
}
const nr = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function ua({ className: t }) {
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
  } = uo(), [h, f] = k("email");
  _(() => {
    c();
  }, [c]);
  const g = nr.find((E) => E.id === h), w = g?.category ?? "", p = (u("email_provider") || "custom") === "custom", y = u("email_smtp_host"), b = !p || y != null && y !== "", A = q(() => {
    const E = r[w] ?? [];
    if (h !== "email") return E;
    const L = p ? xo : Po;
    return E.filter((v) => L.includes(v.key)).sort((v, C) => L.indexOf(v.key) - L.indexOf(C.key));
  }, [r, w, h, p]), N = (E, L) => {
    if (d(E, L), E === "email_provider" && L !== "custom") {
      const v = Lo[L];
      v && (d("email_smtp_host", v), d("email_smtp_port", "587"), d("email_smtp_tls", "true"));
    }
  };
  return a && Object.keys(r).length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${t ?? ""}`, children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : l ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${t ?? ""}`, children: /* @__PURE__ */ e(ee, { error: l.message }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${t ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ e(ho, { status: s, error: n })
    ] }),
    h === "email" && !b && /* @__PURE__ */ e("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: nr.map((E) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${h === E.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => f(E.id),
        "aria-selected": h === E.id,
        role: "tab",
        children: E.label
      },
      E.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: A.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ i("p", { children: [
      "No settings found for ",
      g?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ e(
      Kr,
      {
        settings: A,
        edits: o,
        onChange: h === "email" ? N : d
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
}, ha = [
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
function mc({
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
  const [u, h] = k(o), [f, g] = k(!0), { user: w, logout: m } = ne(), { activeOrg: p, role: y, isLoading: b, fetchOrgs: A, hasPermission: N } = po(), { status: E, isLoading: L, checkStatus: v } = us(), { features: C, isLoading: x } = Zs(), { canAccess: S } = eo(), B = P(
    (F) => {
      h(F), n?.(F);
    },
    [n]
  ), T = ha.filter((F) => !(!r.includes(F.id) || F.requiredFeature && !C[F.requiredFeature] || !S(F.id))), M = T.find((F) => F.id === u), R = !M && !x;
  return _(() => {
    A(), v();
  }, [A, v]), _(() => {
    R && T.length > 0 && h("users");
  }, [R, T.length]), !L && E?.needsSetup ? /* @__PURE__ */ e("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${d}`, children: /* @__PURE__ */ e(la, { onComplete: () => v() }) }) : (b || L || x) && !p ? /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${d}`, children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !p ? /* @__PURE__ */ e("div", { className: `cedros-admin cedros-dashboard ${d}`, children: /* @__PURE__ */ e(ee, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard ${d}`, children: [
    /* @__PURE__ */ i("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__logo", children: [
        de.wallet,
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__logo-text", children: t })
      ] }) }),
      /* @__PURE__ */ i("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          T.filter((F) => !F.group).map((F) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === F.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => B(F.id),
              "aria-current": u === F.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: F.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: F.label })
              ]
            },
            F.id
          ))
        ] }),
        T.some((F) => F.group === "Configuration") && /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
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
                    children: de.chevronRight
                  }
                )
              ]
            }
          ),
          f && T.filter((F) => F.group === "Configuration").map((F) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === F.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => B(F.id),
              "aria-current": u === F.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-icon", children: F.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-dashboard__nav-text", children: F.label })
              ]
            },
            F.id
          ))
        ] })
      ] }),
      w && /* @__PURE__ */ e("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ e(
        Co,
        {
          name: w.name,
          email: w.email,
          picture: w.picture,
          onSettings: l,
          onLogout: c ?? m
        }
      ) })
    ] }),
    /* @__PURE__ */ i("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ e("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-root", children: t }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-sep", children: de.chevronRight }),
        /* @__PURE__ */ e("span", { className: "cedros-dashboard__breadcrumb-current", children: M?.label })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ e(pa, { pageSize: s, currentUserId: w?.id }),
        u === "team" && p && /* @__PURE__ */ e(
          ma,
          {
            orgId: p.id,
            currentUserId: w?.id,
            hasPermission: N,
            role: y
          }
        ),
        u === "deposits" && /* @__PURE__ */ e(fa, { pageSize: s, refreshInterval: a }),
        u === "withdrawals" && /* @__PURE__ */ e(ga, { pageSize: s, refreshInterval: a }),
        u === "settings-auth" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(Eo, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(So, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(ua, {}) }),
        u === "settings-credits" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(Mo, {}) }),
        u === "settings-server" && /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(To, {}) })
      ] })
    ] })
  ] });
}
function pa({ pageSize: t, currentUserId: r }) {
  const [o, a] = k(null), { statsItems: s, isLoading: n, error: l, refresh: c } = vo();
  return o ? /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
    ko,
    {
      userId: o.id,
      currentUserId: r,
      onBack: () => a(null)
    }
  ) }) : /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ e(Gr, { stats: s, isLoading: n, onRefresh: c }),
    l && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: l }),
    /* @__PURE__ */ e(
      No,
      {
        pageSize: t,
        currentUserId: r,
        onUserClick: (d) => a(d)
      }
    )
  ] });
}
function ma({ orgId: t, currentUserId: r, hasPermission: o, role: a }) {
  const [s, n] = k("members"), {
    members: l,
    isLoading: c,
    error: d,
    fetchMembers: u,
    updateMemberRole: h,
    removeMember: f
  } = to(t), {
    invites: g,
    isLoading: w,
    error: m,
    fetchInvites: p,
    createInvite: y,
    cancelInvite: b,
    resendInvite: A
  } = ro(t);
  _(() => {
    u(), p();
  }, [u, p]);
  const N = o("invite:create"), E = o("invite:cancel"), L = g.length, v = l.reduce(
    (B, T) => (B[T.role] = (B[T.role] ?? 0) + 1, B),
    {}
  ), C = v.owner ?? 0, x = v.admin ?? 0, S = v.member ?? 0;
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ e(
      Gr,
      {
        stats: [
          { label: "Owners", value: C },
          { label: "Admins", value: x },
          { label: "Members", value: S },
          { label: "Pending Invites", value: L }
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
            L > 0 && ` (${L})`
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
        so,
        {
          members: l,
          currentUserId: r,
          isLoading: c,
          error: d?.message,
          canManage: o("member:remove"),
          canChangeRoles: o("member:role_change"),
          onUpdateRole: h,
          onRemove: f
        }
      ),
      s === "invites" && /* @__PURE__ */ i("div", { className: "cedros-dashboard__invites", children: [
        N && /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ e(
            oo,
            {
              onSubmit: y,
              isLoading: w,
              error: m?.message
            }
          )
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
          no,
          {
            invites: g,
            isLoading: w,
            error: m?.message,
            canManage: E || N,
            onCancel: E ? b : void 0,
            onResend: N ? A : void 0
          }
        ) })
      ] }),
      s === "permissions" && a === "owner" && /* @__PURE__ */ e(ao, { userRole: a })
    ] })
  ] });
}
function fa({ pageSize: t, refreshInterval: r }) {
  const [o, a] = k("");
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ e(fo, { refreshInterval: r }),
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
        go,
        {
          statusFilter: o || void 0,
          pageSize: t,
          refreshInterval: r
        }
      )
    ] })
  ] });
}
function ga({ pageSize: t, refreshInterval: r }) {
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ e(wo, { refreshInterval: r }),
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ e(yo, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(bo, { pageSize: t, refreshInterval: r }),
      /* @__PURE__ */ e(Ao, { pageSize: t, refreshInterval: r })
    ] })
  ] });
}
var Ee = {}, ct, ar;
function wa() {
  return ar || (ar = 1, ct = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), ct;
}
var lt = {}, Ae = {}, ir;
function ke() {
  if (ir) return Ae;
  ir = 1;
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
var dt = {}, cr;
function zt() {
  return cr || (cr = 1, (function(t) {
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
  })(dt)), dt;
}
var ut, lr;
function ya() {
  if (lr) return ut;
  lr = 1;
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
  }, ut = t, ut;
}
var ht, dr;
function ba() {
  if (dr) return ht;
  dr = 1;
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
  }, ht = t, ht;
}
var pt = {}, ur;
function Aa() {
  return ur || (ur = 1, (function(t) {
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
  })(pt)), pt;
}
var mt = {}, hr;
function va() {
  if (hr) return mt;
  hr = 1;
  const t = ke().getSymbolSize, r = 7;
  return mt.getPositions = function(a) {
    const s = t(a);
    return [
      // top-left
      [0, 0],
      // top-right
      [s - r, 0],
      // bottom-left
      [0, s - r]
    ];
  }, mt;
}
var ft = {}, pr;
function ka() {
  return pr || (pr = 1, (function(t) {
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
      let l = 0, c = 0, d = 0, u = null, h = null;
      for (let f = 0; f < n; f++) {
        c = d = 0, u = h = null;
        for (let g = 0; g < n; g++) {
          let w = s.get(f, g);
          w === u ? c++ : (c >= 5 && (l += r.N1 + (c - 5)), u = w, c = 1), w = s.get(g, f), w === h ? d++ : (d >= 5 && (l += r.N1 + (d - 5)), h = w, d = 1);
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
        for (let h = 0; h < n; h++)
          c = c << 1 & 2047 | s.get(u, h), h >= 10 && (c === 1488 || c === 93) && l++, d = d << 1 & 2047 | s.get(h, u), h >= 10 && (d === 1488 || d === 93) && l++;
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
        const h = t.getPenaltyN1(s) + t.getPenaltyN2(s) + t.getPenaltyN3(s) + t.getPenaltyN4(s);
        t.applyMask(u, s), h < d && (d = h, c = u);
      }
      return c;
    };
  })(ft)), ft;
}
var Oe = {}, mr;
function hs() {
  if (mr) return Oe;
  mr = 1;
  const t = zt(), r = [
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
var gt = {}, Be = {}, fr;
function Na() {
  if (fr) return Be;
  fr = 1;
  const t = new Uint8Array(512), r = new Uint8Array(256);
  return (function() {
    let a = 1;
    for (let s = 0; s < 255; s++)
      t[s] = a, r[a] = s, a <<= 1, a & 256 && (a ^= 285);
    for (let s = 255; s < 512; s++)
      t[s] = t[s - 255];
  })(), Be.log = function(a) {
    if (a < 1) throw new Error("log(" + a + ")");
    return r[a];
  }, Be.exp = function(a) {
    return t[a];
  }, Be.mul = function(a, s) {
    return a === 0 || s === 0 ? 0 : t[r[a] + r[s]];
  }, Be;
}
var gr;
function Ca() {
  return gr || (gr = 1, (function(t) {
    const r = Na();
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
  })(gt)), gt;
}
var wt, wr;
function Ea() {
  if (wr) return wt;
  wr = 1;
  const t = Ca();
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
  }, wt = r, wt;
}
var yt = {}, bt = {}, At = {}, yr;
function ps() {
  return yr || (yr = 1, At.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), At;
}
var me = {}, br;
function ms() {
  if (br) return me;
  br = 1;
  const t = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let o = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  o = o.replace(/u/g, "\\u");
  const a = "(?:(?![A-Z0-9 $%*+\\-./:]|" + o + `)(?:.|[\r
]))+`;
  me.KANJI = new RegExp(o, "g"), me.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), me.BYTE = new RegExp(a, "g"), me.NUMERIC = new RegExp(t, "g"), me.ALPHANUMERIC = new RegExp(r, "g");
  const s = new RegExp("^" + o + "$"), n = new RegExp("^" + t + "$"), l = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return me.testKanji = function(d) {
    return s.test(d);
  }, me.testNumeric = function(d) {
    return n.test(d);
  }, me.testAlphanumeric = function(d) {
    return l.test(d);
  }, me;
}
var Ar;
function Ne() {
  return Ar || (Ar = 1, (function(t) {
    const r = ps(), o = ms();
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
  })(bt)), bt;
}
var vr;
function Sa() {
  return vr || (vr = 1, (function(t) {
    const r = ke(), o = hs(), a = zt(), s = Ne(), n = ps(), l = 7973, c = r.getBCHDigit(l);
    function d(g, w, m) {
      for (let p = 1; p <= 40; p++)
        if (w <= t.getCapacity(p, m, g))
          return p;
    }
    function u(g, w) {
      return s.getCharCountIndicator(g, w) + 4;
    }
    function h(g, w) {
      let m = 0;
      return g.forEach(function(p) {
        const y = u(p.mode, w);
        m += y + p.getBitsLength();
      }), m;
    }
    function f(g, w) {
      for (let m = 1; m <= 40; m++)
        if (h(g, m) <= t.getCapacity(m, w, s.MIXED))
          return m;
    }
    t.from = function(w, m) {
      return n.isValid(w) ? parseInt(w, 10) : m;
    }, t.getCapacity = function(w, m, p) {
      if (!n.isValid(w))
        throw new Error("Invalid QR Code version");
      typeof p > "u" && (p = s.BYTE);
      const y = r.getSymbolTotalCodewords(w), b = o.getTotalCodewordsCount(w, m), A = (y - b) * 8;
      if (p === s.MIXED) return A;
      const N = A - u(p, w);
      switch (p) {
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
    }, t.getBestVersionForData = function(w, m) {
      let p;
      const y = a.from(m, a.M);
      if (Array.isArray(w)) {
        if (w.length > 1)
          return f(w, y);
        if (w.length === 0)
          return 1;
        p = w[0];
      } else
        p = w;
      return d(p.mode, p.getLength(), y);
    }, t.getEncodedBits = function(w) {
      if (!n.isValid(w) || w < 7)
        throw new Error("Invalid QR Code version");
      let m = w << 12;
      for (; r.getBCHDigit(m) - c >= 0; )
        m ^= l << r.getBCHDigit(m) - c;
      return w << 12 | m;
    };
  })(yt)), yt;
}
var vt = {}, kr;
function xa() {
  if (kr) return vt;
  kr = 1;
  const t = ke(), r = 1335, o = 21522, a = t.getBCHDigit(r);
  return vt.getEncodedBits = function(n, l) {
    const c = n.bit << 3 | l;
    let d = c << 10;
    for (; t.getBCHDigit(d) - a >= 0; )
      d ^= r << t.getBCHDigit(d) - a;
    return (c << 10 | d) ^ o;
  }, vt;
}
var kt = {}, Nt, Nr;
function Pa() {
  if (Nr) return Nt;
  Nr = 1;
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
  }, Nt = r, Nt;
}
var Ct, Cr;
function La() {
  if (Cr) return Ct;
  Cr = 1;
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
  }, Ct = o, Ct;
}
var Et, Er;
function Ma() {
  if (Er) return Et;
  Er = 1;
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
  }, Et = r, Et;
}
var St, Sr;
function Ta() {
  if (Sr) return St;
  Sr = 1;
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
  }, St = o, St;
}
var xt = { exports: {} }, xr;
function Ba() {
  return xr || (xr = 1, (function(t) {
    var r = {
      single_source_shortest_paths: function(o, a, s) {
        var n = {}, l = {};
        l[a] = 0;
        var c = r.PriorityQueue.make();
        c.push(a, 0);
        for (var d, u, h, f, g, w, m, p, y; !c.empty(); ) {
          d = c.pop(), u = d.value, f = d.cost, g = o[u] || {};
          for (h in g)
            g.hasOwnProperty(h) && (w = g[h], m = f + w, p = l[h], y = typeof l[h] > "u", (y || p > m) && (l[h] = m, c.push(h, m), n[h] = u));
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
  })(xt)), xt.exports;
}
var Pr;
function Ra() {
  return Pr || (Pr = 1, (function(t) {
    const r = Ne(), o = Pa(), a = La(), s = Ma(), n = Ta(), l = ms(), c = ke(), d = Ba();
    function u(b) {
      return unescape(encodeURIComponent(b)).length;
    }
    function h(b, A, N) {
      const E = [];
      let L;
      for (; (L = b.exec(N)) !== null; )
        E.push({
          data: L[0],
          index: L.index,
          mode: A,
          length: L[0].length
        });
      return E;
    }
    function f(b) {
      const A = h(l.NUMERIC, r.NUMERIC, b), N = h(l.ALPHANUMERIC, r.ALPHANUMERIC, b);
      let E, L;
      return c.isKanjiModeEnabled() ? (E = h(l.BYTE, r.BYTE, b), L = h(l.KANJI, r.KANJI, b)) : (E = h(l.BYTE_KANJI, r.BYTE, b), L = []), A.concat(N, E, L).sort(function(C, x) {
        return C.index - x.index;
      }).map(function(C) {
        return {
          data: C.data,
          mode: C.mode,
          length: C.length
        };
      });
    }
    function g(b, A) {
      switch (A) {
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
      return b.reduce(function(A, N) {
        const E = A.length - 1 >= 0 ? A[A.length - 1] : null;
        return E && E.mode === N.mode ? (A[A.length - 1].data += N.data, A) : (A.push(N), A);
      }, []);
    }
    function m(b) {
      const A = [];
      for (let N = 0; N < b.length; N++) {
        const E = b[N];
        switch (E.mode) {
          case r.NUMERIC:
            A.push([
              E,
              { data: E.data, mode: r.ALPHANUMERIC, length: E.length },
              { data: E.data, mode: r.BYTE, length: E.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            A.push([
              E,
              { data: E.data, mode: r.BYTE, length: E.length }
            ]);
            break;
          case r.KANJI:
            A.push([
              E,
              { data: E.data, mode: r.BYTE, length: u(E.data) }
            ]);
            break;
          case r.BYTE:
            A.push([
              { data: E.data, mode: r.BYTE, length: u(E.data) }
            ]);
        }
      }
      return A;
    }
    function p(b, A) {
      const N = {}, E = { start: {} };
      let L = ["start"];
      for (let v = 0; v < b.length; v++) {
        const C = b[v], x = [];
        for (let S = 0; S < C.length; S++) {
          const B = C[S], T = "" + v + S;
          x.push(T), N[T] = { node: B, lastCount: 0 }, E[T] = {};
          for (let M = 0; M < L.length; M++) {
            const R = L[M];
            N[R] && N[R].node.mode === B.mode ? (E[R][T] = g(N[R].lastCount + B.length, B.mode) - g(N[R].lastCount, B.mode), N[R].lastCount += B.length) : (N[R] && (N[R].lastCount = B.length), E[R][T] = g(B.length, B.mode) + 4 + r.getCharCountIndicator(B.mode, A));
          }
        }
        L = x;
      }
      for (let v = 0; v < L.length; v++)
        E[L[v]].end = 0;
      return { map: E, table: N };
    }
    function y(b, A) {
      let N;
      const E = r.getBestModeForData(b);
      if (N = r.from(A, E), N !== r.BYTE && N.bit < E.bit)
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
    t.fromArray = function(A) {
      return A.reduce(function(N, E) {
        return typeof E == "string" ? N.push(y(E, null)) : E.data && N.push(y(E.data, E.mode)), N;
      }, []);
    }, t.fromString = function(A, N) {
      const E = f(A, c.isKanjiModeEnabled()), L = m(E), v = p(L, N), C = d.find_path(v.map, "start", "end"), x = [];
      for (let S = 1; S < C.length - 1; S++)
        x.push(v.table[C[S]].node);
      return t.fromArray(w(x));
    }, t.rawSplit = function(A) {
      return t.fromArray(
        f(A, c.isKanjiModeEnabled())
      );
    };
  })(kt)), kt;
}
var Lr;
function Da() {
  if (Lr) return lt;
  Lr = 1;
  const t = ke(), r = zt(), o = ya(), a = ba(), s = Aa(), n = va(), l = ka(), c = hs(), d = Ea(), u = Sa(), h = xa(), f = Ne(), g = Ra();
  function w(v, C) {
    const x = v.size, S = n.getPositions(C);
    for (let B = 0; B < S.length; B++) {
      const T = S[B][0], M = S[B][1];
      for (let R = -1; R <= 7; R++)
        if (!(T + R <= -1 || x <= T + R))
          for (let D = -1; D <= 7; D++)
            M + D <= -1 || x <= M + D || (R >= 0 && R <= 6 && (D === 0 || D === 6) || D >= 0 && D <= 6 && (R === 0 || R === 6) || R >= 2 && R <= 4 && D >= 2 && D <= 4 ? v.set(T + R, M + D, !0, !0) : v.set(T + R, M + D, !1, !0));
    }
  }
  function m(v) {
    const C = v.size;
    for (let x = 8; x < C - 8; x++) {
      const S = x % 2 === 0;
      v.set(x, 6, S, !0), v.set(6, x, S, !0);
    }
  }
  function p(v, C) {
    const x = s.getPositions(C);
    for (let S = 0; S < x.length; S++) {
      const B = x[S][0], T = x[S][1];
      for (let M = -2; M <= 2; M++)
        for (let R = -2; R <= 2; R++)
          M === -2 || M === 2 || R === -2 || R === 2 || M === 0 && R === 0 ? v.set(B + M, T + R, !0, !0) : v.set(B + M, T + R, !1, !0);
    }
  }
  function y(v, C) {
    const x = v.size, S = u.getEncodedBits(C);
    let B, T, M;
    for (let R = 0; R < 18; R++)
      B = Math.floor(R / 3), T = R % 3 + x - 8 - 3, M = (S >> R & 1) === 1, v.set(B, T, M, !0), v.set(T, B, M, !0);
  }
  function b(v, C, x) {
    const S = v.size, B = h.getEncodedBits(C, x);
    let T, M;
    for (T = 0; T < 15; T++)
      M = (B >> T & 1) === 1, T < 6 ? v.set(T, 8, M, !0) : T < 8 ? v.set(T + 1, 8, M, !0) : v.set(S - 15 + T, 8, M, !0), T < 8 ? v.set(8, S - T - 1, M, !0) : T < 9 ? v.set(8, 15 - T - 1 + 1, M, !0) : v.set(8, 15 - T - 1, M, !0);
    v.set(S - 8, 8, 1, !0);
  }
  function A(v, C) {
    const x = v.size;
    let S = -1, B = x - 1, T = 7, M = 0;
    for (let R = x - 1; R > 0; R -= 2)
      for (R === 6 && R--; ; ) {
        for (let D = 0; D < 2; D++)
          if (!v.isReserved(B, R - D)) {
            let F = !1;
            M < C.length && (F = (C[M] >>> T & 1) === 1), v.set(B, R - D, F), T--, T === -1 && (M++, T = 7);
          }
        if (B += S, B < 0 || x <= B) {
          B -= S, S = -S;
          break;
        }
      }
  }
  function N(v, C, x) {
    const S = new o();
    x.forEach(function(D) {
      S.put(D.mode.bit, 4), S.put(D.getLength(), f.getCharCountIndicator(D.mode, v)), D.write(S);
    });
    const B = t.getSymbolTotalCodewords(v), T = c.getTotalCodewordsCount(v, C), M = (B - T) * 8;
    for (S.getLengthInBits() + 4 <= M && S.put(0, 4); S.getLengthInBits() % 8 !== 0; )
      S.putBit(0);
    const R = (M - S.getLengthInBits()) / 8;
    for (let D = 0; D < R; D++)
      S.put(D % 2 ? 17 : 236, 8);
    return E(S, v, C);
  }
  function E(v, C, x) {
    const S = t.getSymbolTotalCodewords(C), B = c.getTotalCodewordsCount(C, x), T = S - B, M = c.getBlocksCount(C, x), R = S % M, D = M - R, F = Math.floor(S / M), Z = Math.floor(T / M), he = Z + 1, te = F - Z, H = new d(te);
    let I = 0;
    const U = new Array(M), Q = new Array(M);
    let re = 0;
    const oe = new Uint8Array(v.buffer);
    for (let G = 0; G < M; G++) {
      const le = G < D ? Z : he;
      U[G] = oe.slice(I, I + le), Q[G] = H.encode(U[G]), I += le, re = Math.max(re, le);
    }
    const fe = new Uint8Array(S);
    let pe = 0, z, j;
    for (z = 0; z < re; z++)
      for (j = 0; j < M; j++)
        z < U[j].length && (fe[pe++] = U[j][z]);
    for (z = 0; z < te; z++)
      for (j = 0; j < M; j++)
        fe[pe++] = Q[j][z];
    return fe;
  }
  function L(v, C, x, S) {
    let B;
    if (Array.isArray(v))
      B = g.fromArray(v);
    else if (typeof v == "string") {
      let F = C;
      if (!F) {
        const Z = g.rawSplit(v);
        F = u.getBestVersionForData(Z, x);
      }
      B = g.fromString(v, F || 40);
    } else
      throw new Error("Invalid data");
    const T = u.getBestVersionForData(B, x);
    if (!T)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!C)
      C = T;
    else if (C < T)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + T + `.
`
      );
    const M = N(C, x, B), R = t.getSymbolSize(C), D = new a(R);
    return w(D, C), m(D), p(D, C), b(D, x, 0), C >= 7 && y(D, C), A(D, M), isNaN(S) && (S = l.getBestMask(
      D,
      b.bind(null, D, x)
    )), l.applyMask(S, D), b(D, x, S), {
      modules: D,
      version: C,
      errorCorrectionLevel: x,
      maskPattern: S,
      segments: B
    };
  }
  return lt.create = function(C, x) {
    if (typeof C > "u" || C === "")
      throw new Error("No input text");
    let S = r.M, B, T;
    return typeof x < "u" && (S = r.from(x.errorCorrectionLevel, r.M), B = u.from(x.version), T = l.from(x.maskPattern), x.toSJISFunc && t.setToSJISFunction(x.toSJISFunc)), L(C, B, S, T);
  }, lt;
}
var Pt = {}, Lt = {}, Mr;
function fs() {
  return Mr || (Mr = 1, (function(t) {
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
      const l = s.modules.size, c = s.modules.data, d = t.getScale(l, n), u = Math.floor((l + n.margin * 2) * d), h = n.margin * d, f = [n.color.light, n.color.dark];
      for (let g = 0; g < u; g++)
        for (let w = 0; w < u; w++) {
          let m = (g * u + w) * 4, p = n.color.light;
          if (g >= h && w >= h && g < u - h && w < u - h) {
            const y = Math.floor((g - h) / d), b = Math.floor((w - h) / d);
            p = f[c[y * l + b] ? 1 : 0];
          }
          a[m++] = p.r, a[m++] = p.g, a[m++] = p.b, a[m] = p.a;
        }
    };
  })(Lt)), Lt;
}
var Tr;
function Ia() {
  return Tr || (Tr = 1, (function(t) {
    const r = fs();
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
      const h = r.getImageWidth(n.modules.size, d), f = u.getContext("2d"), g = f.createImageData(h, h);
      return r.qrToImageData(g.data, n, d), o(f, u, h), f.putImageData(g, 0, 0), u;
    }, t.renderToDataURL = function(n, l, c) {
      let d = c;
      typeof d > "u" && (!l || !l.getContext) && (d = l, l = void 0), d || (d = {});
      const u = t.render(n, l, d), h = d.type || "image/png", f = d.rendererOpts || {};
      return u.toDataURL(h, f.quality);
    };
  })(Pt)), Pt;
}
var Mt = {}, Br;
function Fa() {
  if (Br) return Mt;
  Br = 1;
  const t = fs();
  function r(s, n) {
    const l = s.a / 255, c = n + '="' + s.hex + '"';
    return l < 1 ? c + " " + n + '-opacity="' + l.toFixed(2).slice(1) + '"' : c;
  }
  function o(s, n, l) {
    let c = s + n;
    return typeof l < "u" && (c += " " + l), c;
  }
  function a(s, n, l) {
    let c = "", d = 0, u = !1, h = 0;
    for (let f = 0; f < s.length; f++) {
      const g = Math.floor(f % n), w = Math.floor(f / n);
      !g && !u && (u = !0), s[f] ? (h++, f > 0 && g > 0 && s[f - 1] || (c += u ? o("M", g + l, 0.5 + w + l) : o("m", d, 0), d = 0, u = !1), g + 1 < n && s[f + 1] || (c += o("h", h), h = 0)) : d++;
    }
    return c;
  }
  return Mt.render = function(n, l, c) {
    const d = t.getOptions(l), u = n.modules.size, h = n.modules.data, f = u + d.margin * 2, g = d.color.light.a ? "<path " + r(d.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", w = "<path " + r(d.color.dark, "stroke") + ' d="' + a(h, u, d.margin) + '"/>', m = 'viewBox="0 0 ' + f + " " + f + '"', y = '<svg xmlns="http://www.w3.org/2000/svg" ' + (d.width ? 'width="' + d.width + '" height="' + d.width + '" ' : "") + m + ' shape-rendering="crispEdges">' + g + w + `</svg>
`;
    return typeof c == "function" && c(null, y), y;
  }, Mt;
}
var Rr;
function Ua() {
  if (Rr) return Ee;
  Rr = 1;
  const t = wa(), r = Da(), o = Ia(), a = Fa();
  function s(n, l, c, d, u) {
    const h = [].slice.call(arguments, 1), f = h.length, g = typeof h[f - 1] == "function";
    if (!g && !t())
      throw new Error("Callback required as last argument");
    if (g) {
      if (f < 2)
        throw new Error("Too few arguments provided");
      f === 2 ? (u = c, c = l, l = d = void 0) : f === 3 && (l.getContext && typeof u > "u" ? (u = d, d = void 0) : (u = d, d = c, c = l, l = void 0));
    } else {
      if (f < 1)
        throw new Error("Too few arguments provided");
      return f === 1 ? (c = l, l = d = void 0) : f === 2 && !l.getContext && (d = c, c = l, l = void 0), new Promise(function(w, m) {
        try {
          const p = r.create(c, d);
          w(n(p, l, d));
        } catch (p) {
          m(p);
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
var _a = Ua();
const Wa = /* @__PURE__ */ Io(_a);
function Oa({ value: t, size: r = 200, alt: o = "QR code", className: a = "" }) {
  const s = $(null), [n, l] = k(null);
  return _(() => {
    !s.current || !t || Wa.toCanvas(s.current, t, {
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
function gs() {
  const { config: t, _internal: r } = ne(), [o, a] = k(null), [s, n] = k("idle"), [l, c] = k(null), [d, u] = k(!1), [h, f] = k(null), g = q(
    () => new ue({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), w = P(async () => {
    u(!0), f(null);
    try {
      const E = await g.get("/mfa/status");
      return a(E), E;
    } catch (E) {
      const L = O(E, "Failed to get TOTP status");
      throw f(L), L;
    } finally {
      u(!1);
    }
  }, [g]), m = P(async () => {
    u(!0), f(null), n("loading");
    try {
      const E = await g.post("/mfa/setup", {});
      return c(E), n("setup"), E;
    } catch (E) {
      const L = O(E, "Failed to start TOTP setup");
      throw f(L), n("error"), L;
    } finally {
      u(!1);
    }
  }, [g]), p = P(
    async (E) => {
      if (!/^\d{6}$/.test(E)) {
        const L = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(L), L;
      }
      u(!0), f(null), n("verifying");
      try {
        await g.post("/mfa/enable", { code: E }), n("success");
        try {
          const L = await g.get("/mfa/status");
          a(L);
        } catch {
          a({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (L) {
        const v = O(L, "Invalid verification code");
        throw f(v), n("error"), v;
      } finally {
        u(!1);
      }
    },
    [g]
  ), y = P(
    async (E) => {
      if (!E) {
        const L = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw f(L), L;
      }
      u(!0), f(null);
      try {
        await g.post("/mfa/disable", { password: E }), a({ enabled: !1, recoveryCodesRemaining: 0 }), c(null), n("idle");
      } catch (L) {
        const v = O(L, "Failed to disable TOTP");
        throw f(v), v;
      } finally {
        u(!1);
      }
    },
    [g]
  ), b = P(
    async (E) => {
      if (!/^\d{6}$/.test(E)) {
        const L = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw f(L), L;
      }
      u(!0), f(null);
      try {
        return await g.post(
          "/mfa/recovery-codes/regenerate",
          { code: E }
        );
      } catch (L) {
        const v = O(L, "Failed to regenerate recovery codes");
        throw f(v), v;
      } finally {
        u(!1);
      }
    },
    [g]
  ), A = P(() => f(null), []), N = P(() => {
    f(null), c(null), n("idle"), u(!1);
  }, []);
  return {
    status: o,
    setupState: s,
    setupData: l,
    isLoading: d,
    error: h,
    getStatus: w,
    beginSetup: m,
    enableTotp: p,
    disableTotp: y,
    regenerateBackupCodes: b,
    clearError: A,
    reset: N
  };
}
function qa({ onSuccess: t, onCancel: r, className: o = "" }) {
  const { setupState: a, setupData: s, isLoading: n, error: l, beginSetup: c, enableTotp: d, clearError: u, reset: h } = gs(), [f, g] = k("qr"), [w, m] = k(""), [p, y] = k(!1), [b, A] = k(!1), N = $(null);
  _(() => {
    a === "idle" && c().catch(() => {
    });
  }, [a, c]), _(() => {
    a === "success" && t?.();
  }, [a, t]);
  const E = async () => {
    s?.secret && (await navigator.clipboard.writeText(s.secret), y(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => y(!1), 2e3));
  }, L = async () => {
    if (s?.recoveryCodes) {
      const x = s.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(x);
    }
  }, v = async () => {
    try {
      await d(w);
    } catch {
      m("");
    }
  }, C = () => {
    h(), r?.();
  };
  return _(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), a === "loading" || a === "idle" && n ? /* @__PURE__ */ e("div", { className: `cedros-totp-setup ${o}`, children: /* @__PURE__ */ e("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ e(K, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : a === "error" && !s ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${o}`, children: [
    /* @__PURE__ */ e(ee, { error: l, onDismiss: u }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: C,
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
      /* @__PURE__ */ e("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ e(Oa, { value: s.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
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
              children: p ? "Copied!" : "Copy"
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
            onClick: C,
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
      /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: s.recoveryCodes.map((x, S) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: x }, S)) }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: L,
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
            onChange: (x) => A(x.target.checked)
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
        Yr,
        {
          value: w,
          onChange: m,
          onComplete: v,
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
            onClick: v,
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
function fc({ onStatusChange: t, className: r = "" }) {
  const { status: o, isLoading: a, error: s, getStatus: n, disableTotp: l, regenerateBackupCodes: c, clearError: d } = gs(), [u, h] = k("status"), [f, g] = k(""), [w, m] = k(""), [p, y] = k(null), [b, A] = k(!1), [N, E] = k(null);
  _(() => {
    n().catch(() => {
    });
  }, [n]);
  const L = P(() => {
    h("status"), t?.(!0);
  }, [t]), v = async () => {
    A(!0), E(null);
    try {
      await l(f), h("status"), g(""), t?.(!1);
    } catch (S) {
      E(S instanceof Error ? S.message : "Failed to disable 2FA"), g("");
    } finally {
      A(!1);
    }
  }, C = async () => {
    A(!0), E(null);
    try {
      const S = await c(w);
      y(S.recoveryCodes), m("");
    } catch (S) {
      E(S instanceof Error ? S.message : "Failed to regenerate codes"), m("");
    } finally {
      A(!1);
    }
  }, x = async () => {
    p && await navigator.clipboard.writeText(p.join(`
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
  ] }) : u === "setup" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ e(qa, { onSuccess: L, onCancel: () => h("status") }) }) : u === "disable" ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
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
        onChange: (S) => g(S.target.value),
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
            h("status"), g(""), E(null);
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
          onClick: v,
          disabled: b || f.length === 0,
          children: b ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ e(K, { size: "sm" }),
            /* @__PURE__ */ e("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? p ? /* @__PURE__ */ e("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ e("div", { className: "cedros-totp-backup-codes", children: p.map((S, B) => /* @__PURE__ */ e("code", { className: "cedros-totp-backup-code", children: S }, B)) }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: x,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ e("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          h("status"), y(null);
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
      Yr,
      {
        value: w,
        onChange: m,
        onComplete: C,
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
            h("status"), m(""), E(null);
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
          onClick: C,
          disabled: b || w.length !== 6,
          children: b ? /* @__PURE__ */ i(X, { children: [
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
          onClick: () => h("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => h("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => h("setup"),
        children: "Enable two-factor authentication"
      }
    )
  ] }) });
}
class ja {
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
      throw O(o, "Failed to change password");
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
      throw O(o, "Failed to update profile");
    }
  }
}
function za() {
  const { config: t, authState: r, _internal: o } = ne(), [a, s] = k(!1), [n, l] = k(null), c = q(
    () => new ja(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), d = P(() => {
    l(null);
  }, []), u = P(
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
  ), h = P(
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
    changePassword: h,
    clearError: d
  };
}
function gc({
  onPasswordChange: t,
  onClose: r,
  className: o = ""
}) {
  const { user: a } = Fr(), { isLoading: s, error: n, changePassword: l, clearError: c } = za(), [d, u] = k("main"), [h, f] = k(""), [g, w] = k(""), [m, p] = k(""), [y, b] = k(null), [A, N] = k(null), E = Wt(g), L = g === m, v = h.length > 0 && g.length > 0 && m.length > 0 && E.isValid && L, C = P(async () => {
    if (v) {
      b(null), N(null);
      try {
        await l({
          currentPassword: h,
          newPassword: g
        }), f(""), w(""), p(""), N("Password changed successfully. Other sessions have been logged out."), t?.(), setTimeout(() => {
          u("main"), N(null);
        }, 2e3);
      } catch (B) {
        b(B instanceof Error ? B.message : "Failed to change password");
      }
    }
  }, [v, h, g, l, t]), x = P(() => {
    u("main"), f(""), w(""), p(""), b(null), c();
  }, [c]), S = () => a?.name ? a.name.split(" ").map((B) => B[0]).join("").toUpperCase().slice(0, 2) : a?.email ? a.email[0].toUpperCase() : "?";
  return d === "change-password" ? /* @__PURE__ */ e("div", { className: `cedros-profile-settings ${o}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ e("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ e("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (y || n) && /* @__PURE__ */ e("div", { className: "cedros-profile-error", children: /* @__PURE__ */ e(
      ee,
      {
        error: { code: "UNKNOWN_ERROR", message: y || n?.message || "" },
        onDismiss: () => {
          b(null), c();
        }
      }
    ) }),
    A && /* @__PURE__ */ i("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ e("span", { className: "cedros-profile-success-icon", children: "✓" }),
      A
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        we,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: h,
          onChange: (B) => f(B.target.value),
          disabled: s,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "cedros-profile-field", children: /* @__PURE__ */ e(
        we,
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
        we,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: m,
          onChange: (B) => p(B.target.value),
          disabled: s,
          error: m.length > 0 && !L ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: x,
          disabled: s,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: C,
          disabled: s || !v,
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
      ) : /* @__PURE__ */ e("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: S() }) }),
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
function Va() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), n = q(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = P(() => {
    s(null);
  }, []), c = P(
    async (m) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(m) || m <= 0) {
        const p = new Error(
          `Invalid deposit amount: ${m}. Must be a positive integer (lamports).`
        );
        throw s(p.message), p;
      }
      o(!0), s(null);
      try {
        return await n.post("/deposit", {
          amount_lamports: m
        });
      } catch (p) {
        const y = O(p, "Failed to execute deposit");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), d = P(
    async (m) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.get(`/deposit/status/${encodeURIComponent(m)}`);
      } catch (p) {
        const y = O(p, "Failed to get deposit status");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), u = P(async () => {
    if (!n)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return await n.get("/deposit/config");
    } catch (m) {
      const p = O(m, "Failed to get deposit config");
      throw s(p.message), p;
    } finally {
      o(!1);
    }
  }, [n]), h = P(
    async (m) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const p = new URLSearchParams();
        m?.limit !== void 0 && p.set("limit", String(m.limit)), m?.offset !== void 0 && p.set("offset", String(m.offset));
        const y = p.toString(), b = y ? `/deposits?${y}` : "/deposits";
        return await n.get(b);
      } catch (p) {
        const y = O(p, "Failed to list deposits");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), f = P(
    async (m) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const p = new URLSearchParams({
          input_mint: m.inputMint,
          amount: String(m.amount),
          taker: m.taker
        });
        return await n.get(`/deposit/quote?${p}`);
      } catch (p) {
        const y = O(p, "Failed to get deposit quote");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), g = P(
    async (m) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.post("/deposit/public", m);
      } catch (p) {
        const y = O(p, "Failed to execute public deposit");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [n]
  ), w = P(
    async (m) => {
      if (!n)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        return await n.post("/deposit/micro", m);
      } catch (p) {
        const y = O(p, "Failed to execute micro deposit");
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
    listDeposits: h,
    isLoading: r,
    error: a,
    clearError: l
  };
}
function ws({
  tokens: t,
  selectedToken: r,
  onSelect: o,
  openSignal: a,
  placeholder: s = "Select token",
  disabled: n = !1,
  className: l = "",
  searchable: c = !0
}) {
  const [d, u] = k(!1), [h, f] = k(""), g = $(null), w = $(null), m = q(() => {
    if (!h.trim()) return t;
    const A = h.toLowerCase();
    return t.filter(
      (N) => N.symbol.toLowerCase().includes(A) || N.name.toLowerCase().includes(A) || N.mint.toLowerCase().includes(A)
    );
  }, [t, h]);
  _(() => {
    const A = (N) => {
      g.current && !g.current.contains(N.target) && (u(!1), f(""));
    };
    if (d)
      return document.addEventListener("mousedown", A), () => document.removeEventListener("mousedown", A);
  }, [d]), _(() => {
    d && c && w.current && w.current.focus();
  }, [d, c]), _(() => {
    a === void 0 || n || (u(!0), f(""));
  }, [a, n]);
  const p = P(() => {
    n || (u((A) => !A), d && f(""));
  }, [n, d]), y = P(
    (A) => {
      o(A), u(!1), f("");
    },
    [o]
  ), b = P(
    (A) => {
      A.key === "Escape" ? (u(!1), f("")) : A.key === "Enter" && m.length === 1 && y(m[0]);
    },
    [m, y]
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
            onClick: p,
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
                    onError: (A) => {
                      A.target.style.display = "none";
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
              value: h,
              onChange: (A) => f(A.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-token-list", children: m.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ e(X, { children: m.map((A) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${r?.mint === A.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => y(A),
              role: "option",
              "aria-selected": r?.mint === A.mint,
              children: [
                A.logoUrl && /* @__PURE__ */ e(
                  "img",
                  {
                    src: A.logoUrl,
                    alt: A.symbol,
                    className: "cedros-token-icon",
                    onError: (N) => {
                      N.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ i("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-token-symbol", children: A.symbol }),
                  /* @__PURE__ */ e("span", { className: "cedros-token-name", children: A.name })
                ] }),
                r?.mint === A.mint && /* @__PURE__ */ e("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            A.mint
          )) }) })
        ] })
      ]
    }
  );
}
function Vt(t, r) {
  return r.privateDepositsEnabled && t >= r.privateMinUsd ? "private" : t >= r.publicMinUsd ? "public" : "sol_micro";
}
const Ht = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Ha = 1e4, Je = 1e3, ys = 3;
function Qa(t) {
  return Number.isFinite(t) ? `$${Math.round(t)}` : "$0";
}
function Ya(t, r) {
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
        detail: `SOL only under ${Qa(r.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function Qt(t, r, o) {
  return Math.min(Math.max(t, r), o);
}
function Ka(t, r) {
  if (r <= 0) return 0;
  const o = Qt(t / r, 0, 1);
  return Math.round(Math.pow(o, 1 / ys) * Je);
}
function Ga(t, r) {
  const o = Qt(t / Je, 0, 1);
  return r * Math.pow(o, ys);
}
function bs(t) {
  return t < 10 ? 0.01 : t < 100 ? 1 : t < 500 ? 5 : t < 1e3 ? 10 : t < 5e3 ? 25 : 50;
}
function $a(t) {
  return t < 1 ? 2 : 0;
}
function Dr(t) {
  const r = bs(t), o = Math.round(t / r) * r, a = $a(r);
  return Number(o.toFixed(a));
}
function As({
  config: t,
  valueUsd: r,
  onChange: o,
  maxUsd: a = Ha,
  disabled: s = !1,
  className: n = ""
}) {
  const l = Qt(Number.isFinite(r) ? r : 0, 0, a), c = q(() => Vt(l, t), [l, t]), d = Ya(c, t), u = Ka(l, a), h = u / Je * 100;
  return /* @__PURE__ */ i("div", { className: `cedros-tiered-slider ${n}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ e("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            value: l || "",
            onChange: (f) => o(Dr(parseFloat(f.target.value) || 0)),
            placeholder: "Enter amount",
            disabled: s,
            min: 0,
            step: bs(l),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ i("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${c}`, children: [
          c === "sol_micro" && /* @__PURE__ */ e("img", { src: Ht, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        onChange: (f) => o(Dr(Ga(parseFloat(f.target.value), a))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${h}%, var(--cedros-border) ${h}%, var(--cedros-border) 100%)`
        },
        disabled: s,
        "aria-label": "Deposit amount slider"
      }
    ),
    d.note && /* @__PURE__ */ e("div", { className: "cedros-tiered-slider-note", children: d.note })
  ] });
}
function Ja(t) {
  return t.companyFeePercent > 0 || t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap" || t.feePolicy === "user_pays_privacy";
}
function Xa(t, r, o) {
  const { feePolicy: a, privacyFeePercent: s, swapFeePercent: n, companyFeePercent: l } = t;
  let c = l;
  return o || (a === "user_pays_all" ? (c += n, r && (c += s)) : a === "user_pays_privacy" && r ? c += s : a === "user_pays_swap" && (c += n)), c;
}
const je = 1e9, Se = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Ht
}, xe = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, vs = 1e4;
function Za(t, r) {
  const o = r < t.publicMinUsd, a = r >= t.privateMinUsd, s = [], n = !o && a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0), l = !o && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0), c = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  if (n) {
    const d = t.privacyFeeFixedLamports / je, u = t.privacyFeePercent, h = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Privacy", solAmount: d, percent: u, usdAmount: h + f });
  }
  if (l) {
    const d = t.swapFeeFixedLamports / je, u = t.swapFeePercent, h = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Swap", solAmount: d, percent: u, usdAmount: h + f });
  }
  if (c) {
    const d = t.companyFeeFixedLamports / je, u = t.companyFeePercent, h = d * t.solPriceUsd, f = r * (u / 100);
    s.push({ label: "Service", solAmount: d, percent: u, usdAmount: h + f });
  }
  return s;
}
function ks(t, r, o) {
  const a = Za(t, r), s = o < 0.01 ? 0.01 : o;
  if (a.length === 0)
    return `Total: $${s.toFixed(2)}`;
  const n = a.reduce((m, p) => m + p.solAmount, 0), l = a.reduce((m, p) => m + p.percent, 0), c = { fee: 7, sol: 8, rate: 7, usd: 8 }, d = (m) => {
    const p = m.label.padEnd(c.fee), y = m.solAmount.toFixed(4).padStart(6).padEnd(c.sol), b = (m.percent.toFixed(2) + "%").padStart(5).padEnd(c.rate), A = ("$" + Math.max(m.usdAmount, 0.01).toFixed(2)).padEnd(c.usd);
    return `${p} │ ${y} │ ${b} │ ${A}`;
  }, u = `${"Fee".padEnd(c.fee)} │ ${"SOL".padEnd(c.sol)} │ ${"+ Rate".padEnd(c.rate)} │ ${"= Total".padEnd(c.usd)}`, h = `${"─".repeat(c.fee)}─┼─${"─".repeat(c.sol)}─┼─${"─".repeat(c.rate)}─┼─${"─".repeat(c.usd)}`, f = ("$" + s.toFixed(2)).padEnd(c.usd), g = `${"TOTAL".padEnd(c.fee)} │ ${n.toFixed(4).padStart(6).padEnd(c.sol)} │ ${(l.toFixed(2) + "%").padStart(5).padEnd(c.rate)} │ ${f}`;
  return [u, h, ...a.map(d), h, g].join(`
`);
}
function ei(t) {
  const r = [], o = t.privacyFeeFixedLamports > 0 || t.privacyFeePercent > 0, a = t.swapFeeFixedLamports > 0 || t.swapFeePercent > 0, s = t.companyFeeFixedLamports > 0 || t.companyFeePercent > 0;
  return o && r.push("Privacy Cash fee"), a && r.push("swap fee"), s && r.push("company service fee"), r.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Ze(t, r) {
  if (r <= 0) return 0;
  const o = r < t.publicMinUsd, a = r >= t.privateMinUsd, s = Xa(t, a, o);
  let n = t.companyFeeFixedLamports;
  o || (a && (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_privacy") && (n += t.privacyFeeFixedLamports), (t.feePolicy === "user_pays_all" || t.feePolicy === "user_pays_swap") && (n += t.swapFeeFixedLamports));
  const l = n / je * t.solPriceUsd, c = r * (s / 100);
  return l + c;
}
function Ns(t, r, o) {
  return t === "sol" ? "SOL" : t === "single-token" ? r.symbol : o.some((s) => s.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function Ir(t) {
  return t.map((r) => r.trim()).filter(Boolean);
}
const Cs = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function Es(t, r, o) {
  if (Cs.has(t.symbol)) return 1;
  const a = r.tokenPrices?.[t.symbol];
  if (a && a > 0) return a;
  if (t.symbol === "SOL") return r.solPriceUsd || null;
  const s = o?.[t.symbol];
  return s && s > 0 ? s : null;
}
function Ss(t, r) {
  const o = Cs.has(r) ? 2 : 4;
  return t.toFixed(o);
}
function wc({
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
  onUnlockRequired: h,
  onAuthorize: f,
  className: g = "",
  showStepIndicator: w = !0,
  pollInterval: m = 5e3,
  demoMode: p = !1,
  demoAutoConfirmMs: y,
  tokenPriceUsd: b,
  showExplainer: A = !1,
  siteName: N,
  explainerConfig: E
}) {
  const { deposit: L, getStatus: v, error: C, clearError: x } = Va(), S = Xe(), B = Ir(t.quickActionTokens), T = Ir(t.customTokenSymbols), M = q(() => {
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
  }, [a, t.customTokens]), R = q(() => {
    if (T.length === 0) return M;
    const W = M.filter((V) => T.includes(V.symbol));
    return W.length > 0 ? W : M;
  }, [M, T]), D = t.privateDepositsEnabled, F = o ? o === "sign" && !D ? "receive" : o : D && S.hasExternalWallet ? "sign" : "receive", Z = B[0] ? M.find((W) => W.symbol === B[0]) : void 0, he = r === "sol" ? Se : r === "single-token" ? Z ?? M.find((W) => W.symbol === "USDC") ?? M[0] ?? Se : s ?? Z ?? M.find((W) => W.symbol === "USDC") ?? M.find((W) => W.symbol !== "SOL") ?? M[0] ?? Se, te = P(() => A ? "explainer" : "unlock", [A]), [H, I] = k(te), [U, Q] = k(he), [re, oe] = k(""), [fe, pe] = k(null), [z, j] = k(null), [G, le] = k(null), [be, Kt] = k(null), [et, Me] = k(!1), [Ms, tt] = k(!1), [Re, Gt] = k(null);
  _(() => {
    I(te()), Q(he), oe(""), pe(null), j(null), le(null), Kt(null), Me(!1), tt(!1), Gt(null), x();
  }, [r, F, he, x, te]);
  const Ts = n ?? t.privateMinSol, Bs = l, De = parseFloat(re), $t = S.status === "enrolled_locked" || S.status === "enrolled_unlocked" || S.status === "unlocked", rt = $t && S.isUnlocked, st = $t && !S.isUnlocked, Jt = P(() => {
    let Y = F === "sign" ? [
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
    return A && (Y = [{ key: "explainer", label: "Info" }, ...Y]), Y;
  }, [F, A])(), Rs = Jt.findIndex((W) => W.key === H), Xt = P((W) => {
    Q(W);
  }, []), Ds = P(
    async (W) => {
      if (!f) {
        I(F === "sign" ? "confirm" : "show-address");
        return;
      }
      tt(!0), j(null);
      try {
        const Y = await f(W, F === "sign" ? De : null, U);
        le(Y.sessionId), Kt(Y.depositAddress), I(F === "sign" ? "confirm" : "show-address");
      } catch (V) {
        const Y = V instanceof Error ? V : new Error("Authorization failed");
        j(Y.message);
      } finally {
        tt(!1);
      }
    },
    [f, F, De, U]
  ), Is = P(
    async (W, V) => {
      x(), j(null), I("signing");
      const Y = W ?? De, J = V ?? U;
      if (!p) {
        if (st && h) {
          h(), I("confirm");
          return;
        }
        if (!rt) {
          j("Wallet not ready"), I("error");
          return;
        }
      }
      try {
        const ie = Math.floor(Y * Math.pow(10, J.decimals));
        if (p) {
          await new Promise((Ue) => setTimeout(Ue, 1500));
          const Fe = {
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
          pe(Fe), I("success"), c?.(Fe);
          return;
        }
        const ae = await L(ie), Ie = {
          token: r === "sol" ? null : J,
          amount: Y,
          amountSmallestUnit: ie,
          txSignature: ae.txSignature,
          sessionId: ae.sessionId,
          response: ae,
          method: "sign"
        };
        pe(Ie), I("success"), c?.(Ie);
      } catch (ie) {
        const ae = ie instanceof Error ? ie : new Error("Deposit failed");
        j(ae.message), I("error"), d?.(ae);
      }
    },
    [
      L,
      De,
      U,
      r,
      p,
      G,
      rt,
      st,
      h,
      c,
      d,
      x
    ]
  ), Fs = P(() => {
    I("waiting");
  }, []), ot = P(async () => {
    const W = be || S.solanaPubkey;
    if (W)
      try {
        await navigator.clipboard.writeText(W), Me(!0), setTimeout(() => Me(!1), 2e3);
      } catch {
        const V = document.createElement("textarea");
        V.value = W, document.body.appendChild(V), V.select(), document.execCommand("copy"), document.body.removeChild(V), Me(!0), setTimeout(() => Me(!1), 2e3);
      }
  }, [be, S.solanaPubkey]);
  _(() => {
    if (!(H === "confirm" || H === "show-address" || H === "waiting") || !G || p) return;
    let V = !1, Y = 0;
    const J = 360, ie = async () => {
      if (!(V || Y >= J)) {
        Y++;
        try {
          const ae = await v(G);
          if (ae.status === "completed" || ae.status === "detected") {
            const Ie = ae.amountLamports ? ae.amountLamports / Math.pow(10, U.decimals) : 0, Fe = ae.amountLamports || 0, Ue = {
              token: r === "sol" ? null : U,
              amount: Ie,
              amountSmallestUnit: Fe,
              txSignature: ae.txSignature || "",
              sessionId: G,
              response: ae,
              method: "receive",
              depositAddress: S.solanaPubkey ?? void 0
            };
            pe(Ue), I("success"), c?.(Ue);
            return;
          }
        } catch {
        }
        V || setTimeout(ie, m);
      }
    };
    return ie(), () => {
      V = !0;
    };
  }, [
    H,
    G,
    p,
    v,
    U,
    r,
    S.solanaPubkey,
    c,
    m
  ]), _(() => {
    if (!p || !y || H !== "waiting" || F !== "receive" || !be) return;
    const W = window.setTimeout(() => {
      const V = Re ?? t.privateMinUsd, Y = U.symbol === "SOL" && t.solPriceUsd > 0 ? V / t.solPriceUsd : V, J = Math.floor(Y * Math.pow(10, U.decimals)), ie = {
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
      pe(ie), I("success"), c?.(ie);
    }, y);
    return () => window.clearTimeout(W);
  }, [
    p,
    y,
    H,
    F,
    be,
    Re,
    t,
    U,
    r,
    G,
    c
  ]);
  const Us = P(() => {
    I(te()), oe(""), pe(null), j(null), x();
  }, [te, x]);
  return t.enabled ? /* @__PURE__ */ i("div", { className: `cedros-deposit-flow ${g}`, children: [
    w && H !== "error" && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-steps", children: Jt.map((W, V) => {
      const Y = Rs >= V, J = W.key === H;
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
        ti,
        {
          siteName: N,
          config: E,
          depositConfig: t,
          currencyMode: r,
          token: U,
          tokens: R,
          onContinue: () => I("unlock"),
          onCancel: u
        }
      ),
      H === "unlock" && /* @__PURE__ */ e(
        ri,
        {
          token: U,
          tokens: R,
          currencyMode: r,
          depositMethod: F,
          isAuthorizing: Ms,
          error: z,
          onAuthorize: Ds,
          onBack: A ? () => I("explainer") : void 0,
          onCancel: u
        }
      ),
      H === "confirm" && F === "sign" && /* @__PURE__ */ e(
        si,
        {
          token: U,
          tokens: M,
          quickActionSymbols: B,
          customTokenSymbols: T,
          currencyMode: r,
          minAmount: Ts,
          maxAmount: Bs,
          depositAddress: be || S.solanaPubkey,
          walletReady: rt || p,
          needsUnlock: st && !p,
          copied: et,
          isListening: !!G && !p,
          config: t,
          onCopy: ot,
          onTokenSelect: Xt,
          onUnlockRequired: h,
          onConfirm: (W, V) => Is(W, V),
          onBack: () => I("unlock"),
          onCancel: u
        }
      ),
      H === "signing" && /* @__PURE__ */ e(oi, { depositAddress: S.solanaPubkey }),
      H === "show-address" && /* @__PURE__ */ e(
        ni,
        {
          token: U,
          tokens: M,
          quickActionSymbols: B,
          customTokenSymbols: T,
          tokenPriceUsd: b,
          currencyMode: r,
          depositAddress: be || S.solanaPubkey,
          copied: et,
          isListening: !!G && !p,
          config: t,
          onCopy: ot,
          onTokenSelect: Xt,
          onAmountChange: Gt,
          onSent: Fs,
          onBack: () => I("unlock"),
          onCancel: u
        }
      ),
      H === "waiting" && /* @__PURE__ */ e(
        ai,
        {
          token: U,
          depositAddress: be || S.solanaPubkey,
          copied: et,
          feeLine: Re ? `Fees: $${Math.max(Ze(t, Re), 0.01).toFixed(2)} total` : "Fees: calculated after deposit",
          onCopy: ot
        }
      ),
      H === "success" && fe && /* @__PURE__ */ e(ii, { result: fe, config: t, onNewDeposit: Us }),
      H === "error" && /* @__PURE__ */ e(
        ci,
        {
          error: z || C || "An error occurred",
          onRetry: () => I("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ e("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${g}`, children: /* @__PURE__ */ e("p", { children: "Deposits are not currently available." }) });
}
function ti({
  siteName: t,
  config: r,
  depositConfig: o,
  currencyMode: a,
  token: s,
  tokens: n,
  onContinue: l,
  onCancel: c
}) {
  const d = r?.title ?? "How Deposits Work", u = r?.exchangeName ?? "Coinbase", h = Qs(r?.exchangeUrl) ?? "https://www.coinbase.com", f = r?.showExchangeSuggestion !== !1, g = Ns(a, s, n), w = t ? `${t} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", m = r?.body ?? w, p = Ja(o), y = ei(o);
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
          /* @__PURE__ */ e("strong", { children: p ? "Transparent Fees" : "Low Fees" }),
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
      /* @__PURE__ */ e("a", { href: h, target: "_blank", rel: "noopener noreferrer", children: u }),
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
function ri({
  token: t,
  tokens: r,
  currencyMode: o,
  depositMethod: a,
  isAuthorizing: s,
  error: n,
  onAuthorize: l,
  onBack: c
}) {
  const [d, u] = k(""), h = Ns(o, t, r), f = (g) => {
    g.preventDefault(), d.trim() && l(d);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: a === "sign" ? o === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${h} deposit. This allows us to process your withdrawal when the privacy period ends.` : o === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${h} sent to this address will be credited to your account.` }),
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
function si({
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
  copied: h,
  isListening: f,
  config: g,
  onCopy: w,
  onTokenSelect: m,
  onUnlockRequired: p,
  onConfirm: y,
  onBack: b
}) {
  const [A, N] = k(g.privateMinUsd), [E, L] = k(!1), [v, C] = k(!1), [x, S] = k(0), [B, T] = k(null), R = Vt(A, g) === "sol_micro", D = t.symbol === xe.symbol, F = q(() => {
    const z = a.length === 0 ? r : r.filter((le) => a.includes(le.symbol)), j = z.length > 0 ? z : r;
    return j.some((le) => le.symbol === xe.symbol) ? j : [...j, xe];
  }, [r, a]), Z = Ze(g, A), he = Z < 0.01 ? 0.01 : Z, te = D ? "Fees: calculated after deposit" : `Fees: $${he.toFixed(2)} total`, H = D ? "" : ks(g, A, Z), I = Es(R ? Se : t, g), U = I ? A / I : t.symbol === "SOL" && g.solPriceUsd > 0 ? A / g.solPriceUsd : A, Q = U ? Ss(U, R ? "SOL" : t.symbol) : null, oe = A - Z <= 0 && A > 0, fe = !D && A > 0 && !oe && U >= n && U <= l;
  _(() => {
    if (s === "multi-token")
      if (R && t.symbol !== "SOL") {
        T(t);
        const z = r.find((j) => j.symbol === "SOL");
        z && m(z);
      } else !R && B && t.symbol === "SOL" && (m(B), T(null));
  }, [R, t.symbol, s, r, m, B, t]);
  const pe = () => {
    fe && y(U, t);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    s === "multi-token" && !R && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
        o.map((z) => {
          const j = r.find((le) => le.symbol === z), G = t.symbol === z;
          return /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${G ? "is-active" : ""}`,
              onClick: () => {
                j && (L(!1), m(j));
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
              L(!0), S((z) => z + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      E && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        ws,
        {
          tokens: F,
          selectedToken: t,
          onSelect: m,
          openSignal: x
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ e(
      As,
      {
        config: g,
        valueUsd: A,
        onChange: N,
        maxUsd: vs
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: D ? "Sign to send tokens to this address" : `Sign to send ${Q ?? "--"} ${R ? "SOL" : t.symbol} to this address` }),
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
              children: h ? "✓" : "⧉"
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
      h && /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
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
              className: `cedros-deposit-flow-fee-info ${v ? "is-open" : ""}`,
              "data-tooltip": H,
              "aria-label": `Fee breakdown: ${H.replaceAll(`
`, ", ")}`,
              "aria-expanded": v,
              onClick: (z) => {
                z.stopPropagation(), C((j) => !j);
              },
              onBlur: () => C(!1),
              onKeyDown: (z) => {
                z.key === "Escape" && C(!1);
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
      p && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: p,
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
          onClick: pe,
          disabled: !fe || !d || !c,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function oi({ depositAddress: t }) {
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
function ni({
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
  onCopy: h,
  onTokenSelect: f,
  onAmountChange: g,
  onSent: w,
  onBack: m
}) {
  const [p, y] = k(u.privateMinUsd), [b, A] = k(!1), [N, E] = k(!1), [L, v] = k(0), [C, x] = k(null), B = Vt(p, u) === "sol_micro", T = t.symbol === xe.symbol, M = q(() => {
    const U = a.length === 0 ? r : r.filter((oe) => a.includes(oe.symbol)), Q = U.length > 0 ? U : r;
    return Q.some((oe) => oe.symbol === xe.symbol) ? Q : [...Q, xe];
  }, [r, a]), R = Ze(u, p), D = R < 0.01 ? 0.01 : R, F = T ? "Fees: calculated after deposit" : `Fees: $${D.toFixed(2)} total`, Z = T ? "" : ks(u, p, R), he = T || p > 0, te = Es(B ? Se : t, u, s), H = te ? p / te : null, I = H ? Ss(H, t.symbol) : null;
  return _(() => {
    if (n === "multi-token")
      if (B && t.symbol !== "SOL") {
        x(t);
        const U = r.find((Q) => Q.symbol === "SOL");
        U && f(U);
      } else !B && C && t.symbol === "SOL" && (f(C), x(null));
  }, [B, t.symbol, n, r, f, C, t]), _(() => {
    g(p);
  }, [p, g]), l ? /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ e("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    n === "multi-token" && !B && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
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
                Q && (A(!1), f(Q));
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
            className: `cedros-deposit-flow-token-quick-btn ${b ? "is-active" : ""}`,
            onClick: () => {
              A(!0), v((U) => U + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      b && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ e(
        ws,
        {
          tokens: M,
          selectedToken: t,
          onSelect: f,
          openSignal: L
        }
      ) })
    ] }),
    !T && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ e(
        As,
        {
          config: u,
          valueUsd: p,
          onChange: y,
          maxUsd: vs
        }
      )
    ] }),
    T && /* @__PURE__ */ e("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ e("label", { className: "cedros-deposit-flow-label", children: T ? "Send any token to this address" : `Send ${I ?? "--"} ${B ? "SOL" : t.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ e("code", { className: "cedros-deposit-flow-address", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: h,
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
          F,
          !T && /* @__PURE__ */ e(
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
function ai({ token: t, depositAddress: r, copied: o, feeLine: a, onCopy: s }) {
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
function ii({ result: t, config: r, onNewDeposit: o }) {
  const a = t.token ?? Se, s = a.symbol === "SOL" && r.solPriceUsd > 0 ? t.amount * r.solPriceUsd : t.amount, n = Ze(r, s), l = Math.max(s - n, 0), c = n < 0.01 ? 0.01 : n;
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
function ci({ error: t, onRetry: r, onCancel: o }) {
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
const li = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", di = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", ui = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", hi = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", pi = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", mi = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", fi = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", gi = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", wi = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e", yi = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Ht
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: mi
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: wi
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: ui
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: gi
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: pi
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: fi
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: di
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: li
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: hi
  }
];
function xs() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), n = q(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), l = P(() => {
    s(null);
  }, []), c = P(async () => {
    if (!n)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return await n.get("/credits/balance/sol");
    } catch (h) {
      const f = O(h, "Failed to fetch credit balance");
      throw s(f.message), f;
    } finally {
      o(!1);
    }
  }, [n]), d = P(async () => {
    if (!n)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      return (await n.get("/credits/balance")).balances;
    } catch (h) {
      const f = O(h, "Failed to fetch credit balances");
      throw s(f.message), f;
    } finally {
      o(!1);
    }
  }, [n]), u = P(
    async (h) => {
      if (!n)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const f = new URLSearchParams();
        h?.currency && f.set("currency", h.currency), h?.limit && f.set("limit", h.limit.toString()), h?.offset && f.set("offset", h.offset.toString());
        const g = f.toString(), w = g ? `/credits/history?${g}` : "/credits/history";
        return await n.get(w);
      } catch (f) {
        const g = O(f, "Failed to fetch transaction history");
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
function yc({
  showAllCurrencies: t = !1,
  refreshInterval: r = 0,
  compact: o = !1,
  className: a = "",
  onLoad: s
}) {
  const { getBalance: n, getAllBalances: l, isLoading: c, error: d, clearError: u } = xs(), [h, f] = k([]), [g, w] = k(null), m = P(async () => {
    try {
      if (t) {
        const p = await l();
        f(p), s?.(p);
      } else {
        const p = await n();
        f([p]), s?.([p]);
      }
      w(null);
    } catch (p) {
      w(p instanceof Error ? p.message : "Failed to load balance");
    }
  }, [t, n, l, s]);
  if (_(() => {
    m();
  }, [m]), _(() => {
    if (r <= 0) return;
    const p = setInterval(m, r);
    return () => clearInterval(p);
  }, [r, m]), g || d)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-error", children: g || d }),
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
  if (c && h.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${a}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (o) {
    const p = h[0];
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${a}`, children: [
      p ? /* @__PURE__ */ e(
        "span",
        {
          className: "cedros-credit-value",
          title: `${p.balanceLamports} lamports`,
          children: p.display
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
    h.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ e("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-credit-list", children: h.map((p) => /* @__PURE__ */ i("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ e("span", { className: "cedros-credit-currency", children: p.currency }),
      /* @__PURE__ */ e("span", { className: "cedros-credit-amount", children: p.display })
    ] }, p.currency)) })
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
function bi(t, r) {
  const o = t < 0, a = Math.abs(t), s = r.toUpperCase() === "SOL", l = a / Math.pow(10, s ? 9 : 6), c = o ? "-" : "+";
  return s ? `${c}${l.toFixed(4)} SOL` : `${c}$${l.toFixed(2)}`;
}
function Ai(t) {
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
function vi(t) {
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
function ki(t, r) {
  const o = (t || "").toLowerCase();
  return o === "deposit" ? "↓" : o === "spend" || o === "usage" || o === "charge" ? "↑" : o === "refund" ? "←" : o === "bonus" || o === "credit" ? "★" : r ? "+" : "−";
}
function bc({
  defaultTab: t = "all",
  pageSize: r = 10,
  refreshInterval: o = 0,
  className: a = "",
  onLoad: s,
  onTransactionClick: n
}) {
  const { getHistory: l, isLoading: c, error: d, clearError: u } = xs(), [h, f] = k(t), [g, w] = k([]), [m, p] = k(0), [y, b] = k(0), [A, N] = k(null), E = Tt.find((M) => M.key === h) || Tt[0], L = q(() => E.txTypes === null ? g : g.filter((M) => {
    const R = M.txType || "";
    return E.txTypes.some((D) => R.toLowerCase().includes(D.toLowerCase()));
  }), [g, E.txTypes]), v = P(async () => {
    try {
      const M = await l({ limit: r * 3, offset: y });
      w(M.transactions), p(M.total), s?.(M), N(null);
    } catch (M) {
      N(M instanceof Error ? M.message : "Failed to load history");
    }
  }, [r, y, l, s]);
  _(() => {
    b(0);
  }, [h]), _(() => {
    v();
  }, [v]), _(() => {
    if (o <= 0) return;
    const M = setInterval(v, o);
    return () => clearInterval(M);
  }, [o, v]);
  const C = Math.ceil(m / r), x = Math.floor(y / r) + 1, S = (M) => {
    const R = (M - 1) * r;
    b(Math.max(0, Math.min(R, Math.max(0, m - 1))));
  }, B = (M) => {
    f(M);
  };
  if (A || d)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-error ${a}`, children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-error", children: A || d }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            u(), N(null), v();
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
    const D = R.txType || "";
    return M.txTypes.some((F) => D.toLowerCase().includes(F.toLowerCase()));
  }).length;
  return /* @__PURE__ */ i("div", { className: `cedros-tx-history ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: v,
          disabled: c,
          title: "Refresh",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-tx-tabs", children: Tt.map((M) => {
      const R = T(M), D = h === M.key;
      return /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${D ? "cedros-tx-tab-active" : ""}`,
          onClick: () => B(M.key),
          children: [
            M.label,
            R > 0 && /* @__PURE__ */ e("span", { className: "cedros-tx-tab-count", children: R })
          ]
        },
        M.key
      );
    }) }),
    L.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: h === "all" ? "No transactions yet." : `No ${E.label.toLowerCase()} found.` }),
      h === "all" && /* @__PURE__ */ e("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: L.slice(0, r).map((M) => {
        const R = M.amountLamports >= 0;
        return /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-tx-item ${R ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => n?.(M),
            onKeyDown: (D) => {
              (D.key === "Enter" || D.key === " ") && (D.preventDefault(), n?.(M));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `cedros-tx-icon ${R ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: ki(M.txType, R)
                }
              ),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-type", children: vi(M.txType) }),
                  /* @__PURE__ */ e(
                    "span",
                    {
                      className: `cedros-tx-amount ${R ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: bi(M.amountLamports, M.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ e("span", { className: "cedros-tx-description", children: M.description }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: Ai(M.createdAt) })
                ] })
              ] })
            ]
          },
          M.id
        );
      }) }),
      C > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => S(x - 1),
            disabled: x <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          x,
          " of ",
          C
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => S(x + 1),
            disabled: x >= C,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Ps() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), [n, l] = k(null), c = q(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = P(() => {
    s(null);
  }, []), u = P(async () => {
    if (!c)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await c.get("/wallet/withdraw/balances");
    } catch (w) {
      const m = O(w, "Failed to fetch wallet balances");
      throw s(m.message), m;
    }
  }, [c]), h = P(
    async (w, m) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const p = await c.post("/wallet/withdraw/sol", {
          destination: w,
          amount_lamports: m
        });
        return l(p), p;
      } catch (p) {
        const y = O(p, "Failed to withdraw SOL");
        throw s(y.message), y;
      } finally {
        o(!1);
      }
    },
    [c]
  ), f = P(
    async (w, m, p) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      o(!0), s(null);
      try {
        const y = await c.post("/wallet/withdraw/spl", {
          destination: w,
          token_mint: m,
          amount: p
        });
        return l(y), y;
      } catch (y) {
        const b = O(y, "Failed to withdraw token");
        throw s(b.message), b;
      } finally {
        o(!1);
      }
    },
    [c]
  ), g = P(
    async (w = 10, m = 0) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const p = Math.max(1, Math.min(100, Math.trunc(w))), y = Math.max(0, Math.trunc(m)), b = new URLSearchParams({
          limit: String(p),
          offset: String(y)
        });
        return await c.get(
          `/wallet/withdraw/history?${b}`
        );
      } catch (p) {
        const y = O(p, "Failed to fetch withdrawal history");
        throw s(y.message), y;
      }
    },
    [c]
  );
  return {
    withdrawSol: h,
    withdrawSpl: f,
    getBalances: u,
    getHistory: g,
    isSubmitting: r,
    error: a,
    clearError: d,
    lastResult: n
  };
}
const Bt = "So11111111111111111111111111111111111111112", Ni = {
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
function Ci(t) {
  return t.length < 32 || t.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(t);
}
function Rt(t) {
  return t.length <= 16 ? t : `${t.slice(0, 6)}...${t.slice(-6)}`;
}
function qe(t, r) {
  return (Number(t) / Math.pow(10, r)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(r, 6)
  });
}
function Ac({
  onSuccess: t,
  onError: r,
  onCancel: o,
  className: a = ""
}) {
  const s = ve(), { withdrawSol: n, withdrawSpl: l, getBalances: c, isSubmitting: d, error: u, clearError: h } = Ps(), [f, g] = k("loading"), [w, m] = k([]), [p, y] = k(null), [b, A] = k(""), [N, E] = k(""), [L, v] = k(null), [C, x] = k(null), [S, B] = k(null), T = s?.config.solana?.network ?? "mainnet-beta", M = q(() => {
    if (!L?.txSignature) return "";
    const I = `https://explorer.solana.com/tx/${L.txSignature}`;
    return T === "mainnet-beta" ? I : `${I}?cluster=${encodeURIComponent(T)}`;
  }, [L, T]), R = q(() => {
    if (!p || !N) return "0";
    const I = parseFloat(N);
    return isNaN(I) || I <= 0 ? "0" : Math.floor(I * Math.pow(10, p.decimals)).toString();
  }, [N, p]);
  _(() => {
    if (!s) return;
    let I = !1;
    return (async () => {
      try {
        const U = await c();
        if (I) return;
        const Q = [];
        U.solLamports > 0 && Q.push({
          symbol: "SOL",
          mint: Bt,
          decimals: 9,
          rawBalance: String(U.solLamports),
          displayBalance: qe(String(U.solLamports), 9)
        });
        for (const re of U.tokens) {
          const oe = Ni[re.mint] ?? Rt(re.mint);
          Q.push({
            symbol: oe,
            mint: re.mint,
            decimals: re.decimals,
            rawBalance: re.amount,
            displayBalance: qe(re.amount, re.decimals)
          });
        }
        m(Q), g((Q.length > 0, "select"));
      } catch {
        I || (B("Failed to load wallet balances"), g("select"));
      }
    })(), () => {
      I = !0;
    };
  }, [s, c]);
  const D = P(
    (I) => {
      y(I), g("form"), h(), x(null), E("");
    },
    [h]
  ), F = P(() => {
    if (!p) return;
    const I = Number(p.rawBalance) / Math.pow(10, p.decimals);
    p.mint === Bt ? E(String(Math.max(0, I - 0.01))) : E(String(I));
  }, [p]), Z = P(() => {
    if (x(null), !b.trim()) {
      x("Destination address is required");
      return;
    }
    if (!Ci(b.trim())) {
      x("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      x("Please enter a valid amount");
      return;
    }
    if (R === "0") {
      x("Amount is too small");
      return;
    }
    g("confirm");
  }, [b, N, R]), he = P(async () => {
    if (p) {
      g("processing"), h();
      try {
        let I;
        p.mint === Bt ? I = await n(b.trim(), Number(R)) : I = await l(b.trim(), p.mint, R), v(I), g("success"), t?.(I);
      } catch (I) {
        g("confirm"), r?.(I instanceof Error ? I : new Error(String(I)));
      }
    }
  }, [
    p,
    b,
    R,
    n,
    l,
    h,
    t,
    r
  ]), te = P(() => {
    h(), x(null), f === "form" ? (g("select"), y(null), E(""), A("")) : f === "confirm" && g("form");
  }, [f, h]), H = P(() => {
    g("select"), y(null), A(""), E(""), v(null), h(), x(null);
  }, [h]);
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
      S && /* @__PURE__ */ e(ee, { error: S }),
      w.length === 0 && !S && /* @__PURE__ */ e("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ e("div", { className: "cedros-withdrawal-tokens", children: w.map((I) => /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => D(I),
          children: [
            /* @__PURE__ */ e("span", { className: "cedros-withdrawal-token-symbol", children: I.symbol }),
            /* @__PURE__ */ e("span", { className: "cedros-withdrawal-token-balance", children: I.displayBalance })
          ]
        },
        I.mint
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
    f === "form" && p && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-form", children: [
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
          p.symbol
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        p.displayBalance,
        " ",
        p.symbol
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
            onChange: (I) => A(I.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ i("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          p.symbol,
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
              onChange: (I) => E(I.target.value),
              min: "0",
              step: "any"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: F,
              children: "Max"
            }
          )
        ] })
      ] }),
      (C || u) && /* @__PURE__ */ e(ee, { error: C || u || "" }),
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
    f === "confirm" && p && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-confirm", children: [
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
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", children: p.symbol })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ i("span", { className: "cedros-withdrawal-summary-value", children: [
            qe(R, p.decimals),
            " ",
            p.symbol
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ e("span", { className: "cedros-withdrawal-summary-value", title: b, children: Rt(b) })
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
        p?.symbol,
        "..."
      ] })
    ] }),
    f === "success" && L && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ e("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ e("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-subtitle", children: [
        qe(R, p?.decimals ?? 9),
        " ",
        p?.symbol,
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
            children: Rt(L.txSignature)
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
function Ei(t, r) {
  if (t === "sol") return "SOL";
  if (!r) return "SPL";
  const o = yi.find((a) => a.mint === r);
  return o ? o.symbol : `${r.slice(0, 4)}...${r.slice(-4)}`;
}
function Si(t) {
  return t.length <= 12 ? t : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function xi(t) {
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
function vc({
  pageSize: t = 10,
  className: r = "",
  onTransactionClick: o,
  explorerUrl: a = "https://solscan.io"
}) {
  const { getHistory: s, error: n, clearError: l } = Ps(), [c, d] = k([]), [u, h] = k(0), [f, g] = k(0), [w, m] = k(!1), [p, y] = k(null), b = P(async () => {
    m(!0);
    try {
      const L = await s(t, f);
      d(L.items), h(L.total), y(null);
    } catch (L) {
      y(L instanceof Error ? L.message : "Failed to load withdrawal history");
    } finally {
      m(!1);
    }
  }, [t, f, s]);
  _(() => {
    b();
  }, [b]);
  const A = Math.ceil(u / t), N = Math.floor(f / t) + 1, E = (L) => {
    const v = (L - 1) * t;
    g(Math.max(0, Math.min(v, Math.max(0, u - 1))));
  };
  return p || n ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${r}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-withdrawal-error", children: p || n }),
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
    c.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ e("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ e("div", { className: "cedros-tx-list", children: c.map((L) => {
        const v = Ei(L.tokenType, L.tokenMint);
        return /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => o?.(L),
            onKeyDown: (C) => {
              (C.key === "Enter" || C.key === " ") && (C.preventDefault(), o?.(L));
            },
            role: o ? "button" : void 0,
            tabIndex: o ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ i("span", { className: "cedros-tx-type", children: [
                    v,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ i("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: [
                    L.amount,
                    " ",
                    v === "SOL" ? "lamports" : ""
                  ] })
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ i("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ e(
                      "a",
                      {
                        href: `${a}/account/${L.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (C) => C.stopPropagation(),
                        children: Si(L.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ e(
                      "a",
                      {
                        href: `${a}/tx/${L.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (C) => C.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("span", { className: "cedros-tx-date", children: xi(L.createdAt) })
                ] })
              ] })
            ]
          },
          L.id
        );
      }) }),
      A > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
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
          A
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => E(N + 1),
            disabled: N >= A,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function kc({
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
      c ?? /* @__PURE__ */ e(jt, { defaultTab: l, onSuccess: n })
    ] }),
    s && /* @__PURE__ */ e("p", { className: "cedros-terms-footer", children: s })
  ] });
}
function Nc({
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
      c ?? /* @__PURE__ */ e(jt, { defaultTab: l, onSuccess: n })
    ] }) })
  ] });
}
class Pi {
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
      throw O(r, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (r) {
      throw O(r, "Failed to revoke sessions");
    }
  }
}
function Cc() {
  const { config: t, authState: r, _internal: o } = ne(), [a, s] = k([]), [n, l] = k(!1), [c, d] = k(null), u = q(
    () => new Pi(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      o?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, o]
  ), h = P(async () => {
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
    r === "authenticated" ? h() : s([]);
  }, [r, h]);
  const f = P(async () => {
    l(!0), d(null);
    try {
      const w = await u.revokeAllSessions();
      return await h(), w;
    } catch (w) {
      throw d(w), w;
    } finally {
      l(!1);
    }
  }, [u, h]), g = q(() => a.filter((w) => !w.isCurrent).length, [a]);
  return {
    sessions: a,
    isLoading: n,
    error: c,
    fetchSessions: h,
    revokeAllSessions: f,
    otherSessionCount: g
  };
}
function Ec() {
  const { config: t, _internal: r } = ne(), [o, a] = k({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), s = q(
    () => new mo(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      r?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, r]
  ), n = P(
    async (d) => {
      a((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await s.authorize(d), h = {
          allowed: u.allowed,
          reason: u.reason,
          isLoading: !1,
          error: null
        };
        return a(h), h;
      } catch (u) {
        const h = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: u
        };
        return a(h), h;
      }
    },
    [s]
  ), l = P(
    async (d) => (await n(d)).allowed,
    [n]
  ), c = P(() => {
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
function Sc() {
  const { listAllWallets: t, createDerivedWallet: r, deleteDerivedWallet: o } = Pe(), [a, s] = k([]), [n, l] = k(!1), [c, d] = k(null), u = P(async () => {
    l(!0), d(null);
    try {
      const w = await t();
      s(w.wallets);
    } catch (w) {
      const m = w instanceof Error ? w.message : "Failed to list wallets";
      d(m);
    } finally {
      l(!1);
    }
  }, [t]), h = P(
    async (w) => {
      l(!0), d(null);
      try {
        const m = await r({ label: w });
        return await u(), m;
      } catch (m) {
        const p = m instanceof Error ? m.message : "Failed to create wallet";
        throw d(p), m;
      } finally {
        l(!1);
      }
    },
    [r, u]
  ), f = P(
    async (w) => {
      l(!0), d(null);
      try {
        await o(w), await u();
      } catch (m) {
        const p = m instanceof Error ? m.message : "Failed to delete wallet";
        throw d(p), m;
      } finally {
        l(!1);
      }
    },
    [o, u]
  ), g = P(() => d(null), []);
  return {
    wallets: a,
    isLoading: n,
    createWallet: h,
    deleteWallet: f,
    refresh: u,
    error: c,
    clearError: g
  };
}
function xc() {
  const t = ve(), [r, o] = k(!1), [a, s] = k(null), [n, l] = k(null), c = q(() => t ? new ue({
    baseUrl: t.config.serverUrl,
    timeoutMs: t.config.requestTimeout,
    retryAttempts: t.config.retryAttempts,
    getAccessToken: t._internal?.getAccessToken
  }) : null, [t]), d = P(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      const f = await c.get("/wallet/pending-recovery");
      l(f);
    } catch (f) {
      const g = O(f, "Failed to fetch pending recovery");
      throw s(g.message), g;
    } finally {
      o(!1);
    }
  }, [c]), u = P(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    o(!0), s(null);
    try {
      const f = { confirmed: !0 };
      await c.post("/wallet/acknowledge-recovery", f), l(null);
    } catch (f) {
      const g = O(f, "Failed to acknowledge recovery");
      throw s(g.message), g;
    } finally {
      o(!1);
    }
  }, [c]), h = P(() => s(null), []);
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
    clearError: h
  };
}
function Pc(t = {}) {
  const { onExternalSign: r } = t, { solanaPubkey: o, hasExternalWallet: a, status: s, isUnlocked: n } = Xe(), {
    signTransaction: l,
    isSigning: c,
    error: d,
    clearError: u
  } = _n(), h = q(() => a && r ? "external" : s === "enrolled_locked" || s === "enrolled_unlocked" ? "sss" : "none", [a, r, s]), f = h !== "none", g = s === "enrolled_locked" || s === "enrolled_unlocked";
  return {
    signTransaction: P(
      async (m, p) => {
        if (h === "external") {
          if (!r)
            throw new Error("External wallet signing callback not provided");
          return r(m);
        }
        if (h === "sss") {
          if (!p && !n)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return p ? l(m, p) : l(m);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [h, r, n, l]
    ),
    signingMethod: h,
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
const Yt = Hs(null), Ut = {
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
function Li(t, r) {
  return Ls(t, r);
}
function Ls(t, r) {
  const o = { ...t };
  for (const a in r)
    if (Object.prototype.hasOwnProperty.call(r, a)) {
      const s = t[a], n = r[a];
      typeof s == "object" && s !== null && typeof n == "object" && n !== null ? o[a] = Ls(
        s,
        n
      ) : n !== void 0 && (o[a] = n);
    }
  return o;
}
function Lc({
  children: t,
  locale: r = "en",
  translations: o
}) {
  const a = q(() => ({ t: o ? Li(Ut, o) : Ut, locale: r }), [o, r]);
  return /* @__PURE__ */ e(Yt.Provider, { value: a, children: t });
}
function Mc() {
  return Hr(Yt)?.t ?? Ut;
}
function Tc() {
  return Hr(Yt)?.locale ?? "en";
}
export {
  go as AdminDepositList,
  fo as AdminDepositStats,
  Zc as AdminIcons,
  yo as AdminPrivacyPeriodDeposits,
  el as AdminShell,
  No as AdminUserList,
  Ao as AdminWithdrawalHistory,
  bo as AdminWithdrawalQueue,
  wo as AdminWithdrawalStats,
  nn as AppleLoginButton,
  Eo as AuthenticationSettings,
  tl as CEDROS_LOGIN_SECTION_IDS,
  dc as CapabilityWarning,
  mc as CedrosAdminDashboard,
  Dc as CedrosLoginProvider,
  yc as CreditBalance,
  Mo as CreditSystemSettings,
  wc as DepositFlow,
  Ks as EmailLoginForm,
  Gs as EmailRegisterForm,
  al as EmailSettings,
  So as EmbeddedWalletSettings,
  fn as ErrorBoundary,
  ee as ErrorMessage,
  rn as ForgotPasswordForm,
  kc as FullPageLayout,
  Js as GoogleLoginButton,
  bc as History,
  Lc as I18nProvider,
  oo as InviteForm,
  no as InviteList,
  K as LoadingSpinner,
  oc as LoginButton,
  jt as LoginForm,
  nc as LoginModal,
  so as MemberList,
  ic as OrgSelector,
  cc as OrgSwitcher,
  Yr as OtpInput,
  un as PasskeyLoginButton,
  On as PasskeyPrompt,
  we as PasswordInput,
  Mo as PrivacyCashSettings,
  Co as ProfileDropdown,
  Tn as RecoveryPhraseDisplay,
  Bn as RecoveryPhraseInput,
  ac as ResetPasswordForm,
  yi as SUPPORTED_TOKENS,
  pc as SecuritySettings,
  To as ServerSettings,
  lc as SessionList,
  Fo as SettingsPageLayout,
  la as SetupWizard,
  Xs as SolanaLoginButton,
  Nc as SplitPageLayout,
  hc as SystemSettings,
  As as TieredAmountSlider,
  ws as TokenSelector,
  fc as TotpSettings,
  qa as TotpSetup,
  qc as TotpVerify,
  gc as UserProfileSettings,
  ea as WalletAddressRow,
  Un as WalletEnrollment,
  uc as WalletManager,
  Gn as WalletRecovery,
  ta as WalletStatus,
  Vn as WalletUnlock,
  dl as WebhookSettings,
  Ac as WithdrawalFlow,
  vc as WithdrawalHistory,
  rl as cedrosLoginPlugin,
  Ut as defaultTranslations,
  Ic as getEmbeddedWalletInfo,
  Vt as getTierForAmount,
  Fc as isEmbeddedWalletAvailable,
  sl as loginPlugin,
  Li as mergeTranslations,
  Kc as registerMobileWallet,
  cl as useAdminDeposits,
  ol as useAdminShell,
  Jc as useAdminUsers,
  on as useAppleAuth,
  Fr as useAuth,
  _c as useAuthState,
  Wc as useAuthUI,
  Ec as useAuthorize,
  ne as useCedrosLogin,
  xs as useCredits,
  Va as useDeposit,
  jc as useEmailAuth,
  Qc as useGoogleAuth,
  zc as useInstantLink,
  ro as useInvites,
  Tc as useLocale,
  to as useMembers,
  po as useOrgs,
  Wn as usePasskeySigning,
  is as usePasswordReset,
  xc as usePendingRecovery,
  za as useProfile,
  Zs as useServerFeatures,
  Cc as useSessions,
  us as useSetup,
  Gc as useSolanaAuth,
  io as useSystemSettings,
  gs as useTotp,
  Vc as useTotpVerify,
  Pc as useTransactionSigning,
  Mc as useTranslations,
  Xe as useWallet,
  Fn as useWalletEnrollment,
  Pe as useWalletMaterial,
  Kn as useWalletRecovery,
  _n as useWalletSigning,
  Sc as useWallets,
  dn as useWebAuthn,
  Ps as useWithdrawal,
  Wt as validatePassword
};
