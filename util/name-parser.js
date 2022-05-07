const getOptimalName = (givenName) => {
    const name = givenName.trim();
    if (name.split(' ')[0].length < 3) return name;
    return name.split(' ')[0];
};

module.exports = { getOptimalName };
