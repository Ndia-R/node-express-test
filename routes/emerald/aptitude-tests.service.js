const { AptitudeTestMst } = require("../../db/emerald/AptitudeTestMst");

class AputitudeTestService {
  findAll() {
    return AptitudeTestMst;
  }

  findOne(id) {
    const aptitudeTest = AptitudeTestMst.find((x) => x.id === Number(id));
    return aptitudeTest;
  }

  create({ name, passScore }) {
    const id = Math.max(...AptitudeTestMst.map((x) => x.id)) + 1;
    const newAptitudeTest = {
      id: id,
      name: name,
      passScore: passScore,
    };
    AptitudeTestMst.push(newAptitudeTest);
  }
}

module.exports = AputitudeTestService;
