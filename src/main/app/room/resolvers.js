const helpers = require("./helpers");
const { room, roomCreate, roomToggleDnD } = require("./validators");

const resolvers = {
  Query: {
    async rooms(_, { ids }, ctx, info) {
      const rooms = await helpers.getData(ids);
      return rooms;
    },
    async RoomsType(_, { slugs }) {
      return await helpers.Types(slugs);
    },
  },

  Mutation: {
    async createRoom(_, { data }, ctx, info) {
      await roomCreate.validateAsync(data, { abortEarly: false });

      return await helpers.create(data);
    },
    async updateRoom(_, { data }, ctx, info) {
      await room.validateAsync(data, { abortEarly: false });
      return await helpers.update(data);
    },
    async toggleDnD(_, { data }, { user, pubsub }, info) {
      // await roomToggleDnD.validateAsync(data, { abortEarly: false });
      return await helpers.update(data);
    },
    async deleteRoom(_, { roomId }, ctx, info) {
      return await helpers.delete(roomId);
    },
  },
};

module.exports = resolvers;
