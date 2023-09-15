let allStudents = [
    'A',
    'B-',
    1,
    4,
    5,
    2
  ]
  
  let studentsWhoPass = [];

  for (const student of allStudents) {
    if ((typeof student === "string" && student !== "C-") || student >= 3){
        studentsWhoPass.push(student);
    }
  }

  for (const student of studentsWhoPass) {
    console.log(student);
  }
