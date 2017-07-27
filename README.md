# fixpb

A tool that downloads photobucket images from your database, stores them where you want, and updates the database image location.

Requires Node >= 6

## Usage

```
$ fixpb --help

  Usage
    $ fixpb <input>

  Options
    --config,  -c   Path to config.json
    --dry-run, -d   Dry run

  Examples
    $ fixpb -c ./config.json
```

Run `setup` to generate a new `config.json` file. Be sure to edit this file with your configuration.

## Adapters

Currently supported adapters:

- phpbb3

## Storage

Currently supported storage:

- file

## config options

#### `adapter`

One of: phpbb

#### `table_prefix`

Specify your table prefix if needed.

#### `db`

Specify the connection info for your db.

```json
{
  "host": "localhost",
  "database": "",
  "user": "",
  "password": ""
}
```

#### `file`

Will be used to write image to disk and update the url in the db.

```json
{
  "location": "/path/on/disk",
  "prefix": "https://example.com/images/"
}
```

**location**

The absolute path where you want to store your images.

**prefix**

This prefix will be prepended to the file path and set in the db. A trailing slash is required.
