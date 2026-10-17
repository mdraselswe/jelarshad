-- A place's phone number, web address (a website or its Facebook page) and opening hours as text.
-- People add them when they add a place, or suggest them later; an admin approves a suggestion.
alter table places
  add column phone text check (char_length(phone) <= 30),
  add column website text check (char_length(website) <= 200),
  add column hours_text text check (char_length(hours_text) <= 120);
