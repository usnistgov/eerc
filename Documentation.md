# Documentation

## Master file

The master documentation file(s) are in the root of this repo. It will be the newest version of
the MS Word document titled `EERC User Guide*.docx` . The versions published on the web site must
be manually derived from that document by opening the file in Word and using Save As... to export
the file.

# Procedure

1. Open the .docx file in Word. Choose File -> Save As and change the name to `EERC User Guide` (without any date codes). Choose the format "HTML - Filtered" format and save. This will create a .html file and a .fld folder (directory) that contains the images. Copy those files in the same structure into the public/ directory (overwriting the previous files). Close the document.
2. Open the original .docx file again. Choose File -> Save As and change the name to `EERC User Guide` again. Now choose the format "PDF" and save. This will create a PDF file `EERC User Guide.pdf` . Copy that file into public/, overwriting the previous version.

You can now remove all EERC User Guide files in the repo root directory EXCEPT for the .docx file. Use `git add filename` to add the new .docx file to Git. Use `git status` to look for newly created files in public/ that need to be added or old ones that got removed, and commit and push the changes.
