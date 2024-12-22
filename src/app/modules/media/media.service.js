 
const QueryBuilder = require('../../../builder/queryBuilder');
const ApiError = require('../../../errors/ApiError');
const { Adds } = require('./media.model');

const insertIntoDB = async (files, payload) => {
  if (!files?.adds_image) {
    throw new ApiError(400, 'File is missing');
  }
 
  if (files?.adds_image) {
    payload.adds_image = `/images/adds/${files.adds_image[0].filename}`;
  }

  return await Adds.create(payload);
};

const allAdds = async (query) => {
  const addsQuery = new QueryBuilder(Adds.find(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await addsQuery.modelQuery;
  const meta = await addsQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const updateAdds = async (req) => {
  const { files } = req;
  const id = req.params.id;
  const { ...AddsData } = req.body;

  if (files && files.image) {
    AddsData.image = `/images/image/${files.image[0].filename}`;
  }

  const isExist = await Adds.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Adds not found!');
  }

  const result = await Adds.findOneAndUpdate(
    { _id: id },
    { ...AddsData },
    {
      new: true,
    }
  );

  return result;
};

const deleteAdds = async (id) => {
  const isExist = await Adds.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(404, 'Adds not found!');
  }
  return await Adds.findByIdAndDelete(id);
};

const AddsService = {
  insertIntoDB,
  allAdds,
  updateAdds,
  deleteAdds,
}

module.exports = AddsService;
