Node Github Webhook for Trello
=====================

A github hook that creates a checklist element in a trello card when an issue with a specific name is created on github.

For example:

* You have a card on trello with ID=ABCDE.
* You create an issue that contains [ABCDE] in it's title
* The webhook automatically generates a checklist on the Trello card, with the issue name.
* When the issue is closed, the webhook will mark that issue as done on Trello.


## How it works
Simply setup three ENVs, that contains TRELLO KEYS:

```bash
TRELLO_KEY=<your api key>
TRELLO_SECRET=<your api secret>
TRELLO_TOKEN=<your token>
```

To obtain those data, please refer to the documentation of this module:

https://github.com/adunkman/node-trello

## TODO

* Refactor
* Improve checklist checks
