const { gql } = require('apollo-server-express')

// Define our schema using the GraphQL schema language
const schema = gql`
  enum CategoriesAge {
    Senior
    Junior
    Cadet
    Cadette
    Minime
    Benjamin
    Poussin
    Poucet
  }

  type Room {
    id: ID
    number: Int
    floor: Int
    """
    Status values :
    1    |    Nettoyé
    2    |    A vérifier
    3    |    A néttoyer
    """
    status: Int
    attendance: Int
    dnd: Boolean
    startAt: String
    expiresAt: String
    type: RoomType
    occupants: [Occupant]
    graTasks: [Task]
  }

  input RoomInput {
    id: Int
    number: Int
    floor: Int
    status: Int
    attendance: Int
    dnd: Boolean
    startAt: String
    expiresAt: String
    type: Int
    occupants: [OccupantInput]
  }

  type RoomType {
    id: ID
    value: String
  }

  type Occupant {
    category: CategoriesAge
    count: Int
  }

  input OccupantInput {
    id: Int
    category: CategoriesAge
    count: Int
  }

  type RoomsTypein {
    id: Int
    value: String
  }

  extend type Query {
    rooms(ids: [ID]): [Room]
    # @hasAccess(slug: "rooms", scope: "view")
    RoomsType(slugs: [String]): [RoomsTypein]
    #  @isAuthenticated
  }

  extend type Mutation {
    createRoom(data: RoomInput): Room
    # @hasAccess(slug: "rooms", scope: "create")
    updateRoom(data: RoomInput): Room
    # @hasAccess(slug: "rooms", scope: "edit")
    toggleDnD(data: RoomInput): Room
    # @hasAccess(slug: "rooms", scope: "edit")
    deleteRoom(roomId: Int): Boolean
  }
`

module.exports = schema
