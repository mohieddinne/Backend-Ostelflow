const Joi = require("@hapi/joi");

const number = Joi.number().required().label("number");
const id = Joi.number().label("id");
const floor = Joi.date().label("floor");
const status = Joi.number().required().label("status");
const attendance = Joi.number().label("attendance");
const type = Joi.number().required().label("type");
const dnd = Joi.boolean().label("dnd");
const startAt = Joi.date().label("startAt");
const expiresAt = Joi.date().label("expiresAt");
const count = Joi.number().label("count");
const category = Joi.string()
  .valid(
    "Senior",
    "Junior",
    "Cadet",
    "Cadette",
    "Minime",
    "Benjamin",
    "Poussin",
    "Poucet"
  )
  .label("category");

const occupant = {
  category,
  count
};
const room = {
  number,
  floor,
  status,
  type,
  startAt,
  expiresAt,
  attendance,
  dnd,
  id,
  occupants: Joi.array().items(Joi.object().keys(occupant))
};

const roomCreate = {
  number,
  floor,
  status,
  type,
  startAt,
  expiresAt,
  attendance,
  dnd,
  occupants: Joi.array().items(Joi.object().keys(occupant))
};

const roomToggleDnD = {
  id,
  dnd,
  // status
};

module.exports = {
  room: Joi.object().keys(room),
  roomCreate: Joi.object().keys(roomCreate),
  roomToggleDnD: Joi.object().keys(roomToggleDnD)
};
