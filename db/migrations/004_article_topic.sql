-- Links an article to the planned topic it fulfils, so /articles turns that topic from Planned to Published
-- instead of listing it twice. Null means a new topic that isn't in the planned list.
-- Do not edit after it has been applied; add a new file instead.

alter table articles add column if not exists topic text check (char_length(topic) <= 200);
