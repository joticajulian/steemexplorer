/**
 * comment
 */
const comment = {
  name: 'Post/Comment',
  operation: 'comment',
  authorities: ['posting'],
  description:
`
Operation to create posts and comments.
For posts parent_author is empty and parent_permlink is the principal tag.
For comments use the actual parent_author and parent_permlink.
`,
  params: {
    parent_author: {
      name: 'Parent author',
      type: 'string',
      placeholder: 'Leave empty for posts',
    },
    parent_permlink: {
      name: 'Parent permlink',
      type: 'string',
      placeholder: 'Principal tag (for posts) or parent permlink (for comments)',
    },
    author: {
      name: 'Author',
      type: 'account',
      placeholder: 'Author',
    },
    permlink: {
      name: 'Permlink',
      type: 'string',
      placeholder: 'Permlink',
    },
    title: {
      name: 'Title',
      type: 'string',
      placeholder: 'Title',
    },
    body: {
      name: 'Body',
      type: 'textarea',
      rows: 10,
      placeholder: '',
    },
    json_metadata: {
      name: 'JSON Metadata',
      type: 'json',
      placeholder: '',
    }      
  }
}

var operations = {}
operations[ comment.operation ] = comment

export default operations
