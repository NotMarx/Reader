# 0.1.4 (Community)

Added new setting configuration which allows user to whether read in a new embed or current. See `n;config` for more options!

## Additions

- `Read` button behaviour is now depend on the current settings applied. The options are `new` and `current`; default is `current`.
- Added a new button called `Show Cover` and `Hide Cover`. I noticed the thumbnail is too small for mobile platform. 

## Breaking Changes

- `n;config --settings <option> --value <value>` has been replaced with `n;config --option <option> --value <value>`. I noticed the old sounds a bit off so I fix that.

## Patches

- `n;bookmark` should now load properly. It may be slow to load as it require lots of time to process your data. 
- Fixed case sensitivity for `n;config`. Incase you allow cap locks on, there should be no problem adjusting the bot with HUGE letters.
- Favorites count now represent in locale string.

---

# 0.1.4 (Dev)

News update regarding to `0.1.4` dev code edition.

## Additions

- Improve `ButtonNavigator` class and the rest to handle reading states and handle for cover/hide book cover.
- Added JSDoc for some methods to ease developers (especially me) to memorize its own function.
- Added new `reading-state` option for `n;config`. This allow users to read in a new page or overriding their search query/bookmark.
- Added an improved guild database creation. This will runs when the bot is invited into a guild for the first time (or when guild data hasn't been created yet)
- Added new 2 interactionCreate events (`show_book_cover_{messageID}` and `hide_book_cover_{messageID}`) to support the handling of show/hide book cover. 
- 6 new strings have been added in this update. The new strings have also been added to Crowdin and ready for translation.

## Breaking Changes

- `flag.settings` has been replaced with `flag.option`.

## Patches

- Favorites count now represent in locale string. Fixed using `.toLocaleString()`.
- Fixed alias command.
- Warning log message will shows `N/A` instead of `undefined` incase it happens frequently.
- Shard ping will log as `N/A` if it logged as `Infinity`.
- On ready session, the console will log both username and discriminator instead of username.

### Upcoming Possible Fixes

- Attempting to fix (or at least prevent) the cause of [#1](https://github.com/reinhello/Reader/issues/1).
- Used all strings from `Languages/LANG.json` file instead of separate to fully support multilingual.

# Contributors

- [@reinhello](https://github.com/reinhello) (**Project Lead**, **Contributor**)

---
