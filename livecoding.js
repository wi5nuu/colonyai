const { data } = require("browserslist");

//-- data json
const people = [
  {
    id: 1,
    name: "Andi Saputra",
    age: 28,
    gender: "Male",
    email: "andisaputra@gmail.com",
    phone: "081274869284",
    address: "Jln.KH Agus Salim No.14 Bekasi"
  },
  {
    id: 2,
    name: "Sitti Nurhaliza",
    age: 25,
    gender: "Female",
    email: "sitti@gmail.com",
    phone: "081274782012",
    address: "Cikarang Utara, Bekasi",
  },
];

function updateAndMoveToFrontend(dataArray, targetId, newData) {
const dataArray = dataArray.find(person => person.id === targetid);

const updateObject = { ...dataArray, ...mean};