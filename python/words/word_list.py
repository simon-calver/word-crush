import os
import re
import shutil

sort_lists = True

this_dir = os.path.dirname(os.path.realpath(__file__))
# sys.path.append(os.path.realpath(os.path.join(this_dir, "python-utilities")))

dict_text = open("brit-a-z.txt", "r")
eng_words = dict_text.read().split("\n")

bad_words_text = open("bad-word-list.txt", "r")
bad_words = set(bad_words_text.read().split("\n"))

extra_words_text = open("extra-word-list.txt", "r")
extra_words = set(extra_words_text.read().split("\n"))

# Check words are not in both lists
intersection = list(bad_words & extra_words)
if len(intersection) > 0:
    print("Make your mind up on these: ", intersection)
    
extra_words = list(extra_words)
bad_words = list(bad_words)

if sort_lists:
    for words, filename in zip([bad_words, extra_words], ["bad-word-list.txt", "extra-word-list.txt"]):
        words.sort()
        words_save_file = open(filename, "w", newline="\n")
        first = True
        for word in words:
            if first:
                words_save_file.write(word)
                first = False
            else:
                words_save_file.write("\n" + word)
        words_save_file.close()
    
# Remove bad words
eng_words = [word for word in eng_words if word not in bad_words]
 
# Add extra words and sort so it's alphabetical
for word in extra_words:
    if word not in eng_words:        
        eng_words += [word]
eng_words.sort()

# Remove words with apostrophes
eng_words = [word for word in eng_words if "'" not in word]

# Remove words with capital letters
eng_words = [word for word in eng_words if not re.match(r"\w*[A-Z]\w*", word)]

# Remove words that are too long or short
min_length = 2
max_length = 5

words_list = [word for word in eng_words if len(word) >= min_length and len(word) <= max_length]

text_save_file = open("word-list.txt", "w", newline="\n")
first = True
for word in words_list:
    if first:
        text_save_file.write(word)
        first = False
    else:
        text_save_file.write("\n" + word)
text_save_file.close()

# Save to Word-game assets
src_path = r"word-list.txt"
dst_path = os.path.realpath(os.path.join(this_dir, "..", "..", "assets", "text"))

shutil.copy(src_path, dst_path)