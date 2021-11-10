const Joi = require("@hapi/joi");

const createdBy = Joi.number().required().label("createdBy");
const assignedOn = Joi.date().label("assignedOn");
const startedOn = Joi.date().required().label("startedOn");
const endedOn = Joi.date().required().label("endedOn");
const priority = Joi.number().required().label("priority");
const roomId = Joi.number().required().label("roomId");
const taskId = Joi.number().required().label("taskId");
const timeSheetId = Joi.number().label("timeSheetId");
const problem = Joi.number().required().label("problem");

const email = Joi.string()
  .email()
  .min(8)
  .max(254)
  .trim()
  .lowercase()
  .required()
  .label("Email");

const firstName = Joi.string().max(100).trim().required().label("firstName");

const user = Joi.object().keys({
  email,
  firstName,
});
const task = {
  createdBy,
  assignedOn,
  priority,
  roomId,
  user,
};

const timeSheet = {
  roomId,
  taskId,
  //   startedOn,
  //   endedOn,
  timeSheetId,
};
module.exports = {
  task: Joi.object().keys(task),
  maintainTask: Joi.object().keys({ ...task, problem }),
  timeSheet: Joi.object().keys(timeSheet),
};
