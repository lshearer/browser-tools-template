# my-custom-browser-tools
Framework for in-browser debugging and development tools.

## Usage

Do you want to make this your own? Here's how to adapt this template to work with your
own website.

1. Fork the repo.
2. Update the [messages.json](src/wrappers/chrome-extension/_locales/en/messages.json) file with your own configuration.
3. Update the [manifest.json](src/wrappers/chrome-extension/manifest.json) file's `externally_connectable.matches` field. This should match the content in `site_local_dev_hosts` and `site_host_suffixes` in `messages.json`.
4. Update the icons for the [chrome extension](src/wrappers/chrome-extension/images/icon.png) and [iframe fallback](src/wrappers/iframe/popup/icon.jpg) (keep naming the same or you'll need to update references as well).
4. Run the examples using `npm start`. This will compile the shared scripts, start a webserver, and launch the examples directory.

## Changelog
See the [changelog](CHANGELOG.md).
