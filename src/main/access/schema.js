const { gql } = require("apollo-server-express");

// Define our schema using the GraphQL schema language
const schema = gql`
  type Role {
    id: Int
    name: String
    accesses: [Access]
  }

  type Access {
    id: Int
    privilege_id: Int
    name: String
    slug: String
    can_view: Boolean
    can_view_own: Boolean
    can_edit: Boolean
    can_create: Boolean
    can_delete: Boolean
    # allow_view: Boolean
    # allow_view_own: Boolean
    # allow_edit: Boolean
    # allow_create: Boolean
    # allow_delete: Boolean
    page_flag: Boolean
  }

  input RoleInput {
    id: Int!
    name: String
  }

  input AccessInput {
    id: Int
    name: String
    slug: String
  }

  extend type Query {
    roles(ids: [Int]): [Role] @hasAccess(slug: "permissions", scope: "view")
    getRoleId(name: String!): Int @hasAccess(slug: "permissions", scope: "view")
    accesses(ids: [Int]): [Access]
      @hasAccess(slug: "permissions", scope: "view")
  }

  extend type Mutation {
    privilege(role: Int!, slug: String!, privilege: String!): Boolean
      @hasAccess(slug: "permissions", scope: "edit")
    role(item: RoleInput!): Role
      @hasAccess(slug: "permissions", scope: "create")
  }
`;

module.exports = schema;
