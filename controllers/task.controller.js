const Task = require('../models/task.model');
const paginationHelper = require('../helpers/pagination');
const searchHelper = require('../helpers/search');

// [GET]: api/tasks/
module.exports.index = async (req, res) => {
  const find = {
    $or: [
      { createdBy: req.user.id },
      { listUser: req.user.id  }
    ],
    deleted: false
  }

  if (req.query.status) {
    find.status = req.query.status;
  }

  // Sorting
  const sort = {}
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }

  // Search
  const objectSearch = searchHelper(req.query);
  if(objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //Pagination
  const countTasks = await Task.countDocuments(find);

  let objectPagination = paginationHelper({
    currentPage: 1,
    limitItems: 2,
  },
    req.query,
    countTasks
  );
  //End Pagination

  const tasks = await Task.find(find)
  .sort(sort)
  .limit(objectPagination.limitItems)
  .skip(objectPagination.skip);

  res.json(tasks);
}

// [GET]: api/tasks/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id;

  const task = await Task.findOne({
    _id: id,
    deleted: false
  })

  res.json(task);
}

// [PATCH]: api/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Task.updateOne({
      _id: id,
      status: status
    })

    res.json({
      code: 200,
      message: 'Status updated successfully'
    });
  } catch {
    res.json({
      code: 400,
      message: 'Error updating status'
    });
  }
}

// [PATCH]: api/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    switch (key) {
      case 'status':
        await Task.updateMany({
          _id: { $in: ids },
        }, {
          status: value
        });

        res.json({
          code: 200,
          message: 'Status updated successfully'
        });
        break;

      case 'delete':
        await Task.updateMany({
          _id: { $in: ids },
        }, {
          deleted: true,
          deletedAt: Date.now()
        });

        res.json({
          code: 200,
          message: 'Delete multi successfully'
        });
        break;

      default:
        res.json({
          code: 400,
          message: 'Error updating status'
        });
        break;
    }
    

  } catch {
    res.json({
      code: 400,
      message: 'Error updating status'
    });
  }
}

// [CREATE]: api/tasks/create
module.exports.create = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const task = new Task(req.body);
    const data = await task.save();

    res.json({
      code: 200,
      message: 'Created task successfully',
      data: data
    });
  } catch {
    res.json({
      code: 400,
      message: 'Error creating task'
    });
  }
}

// [EDIT]: api/tasks/edit/:id/
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, req.body);

    res.json({
      code: 200,
      message: 'Edit task successfully'
    });

  } catch {
    res.json({
      code: 400,
      message: 'Error editing task'
    });
  }
}

// [DELETE]: api/tasks/delete/:id/
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, {
      deleted: true,
      deletedAt: new Date()
    });

    res.json({
      code: 200,
      message: 'Delete task successfully'
    });

  } catch {
    res.json({
      code: 400,
      message: 'Error deleting task'
    });
  }
}