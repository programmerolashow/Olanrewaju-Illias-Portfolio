-- Adds a Zenodo record link (zenodo.org) to articles, shown next to the Google Scholar link.
-- An article now needs at least one of: an uploaded file, a Google Scholar link or a Zenodo link.
-- Do not edit after it has been applied; add a new file instead.

alter table articles add column if not exists zenodo_url text check (char_length(zenodo_url) <= 500);

alter table articles drop constraint if exists articles_check;
alter table articles add constraint articles_has_source_check
  check (file_url is not null or scholar_url is not null or zenodo_url is not null);
