export const CUSTOMER_LIST_QUERY = `
query getCustomers($first: Int!, $after: String) {
  customers(first: $first, after: $after) {
    edges {
      node {
        id
        firstName
        lastName
        email
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

export const CUSTOMER_ORDERS_QUERY = `
query getCustomerOrders($customerId: ID!, $first: Int!, $after: String) {
  customer(id: $customerId) {
    orders(first: $first, after: $after) {
      edges {
        node {
          totalPriceSet {
            shopMoney {
              amount
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`;