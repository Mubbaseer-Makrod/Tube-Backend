const asyncHandler = (requestHandler) => { 
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next ))
        .catch((err) => next(err))
    }
}

/*

Methode: 1 Above code using normal function 

function asyncHandler(requestHandler) {
    return function(req, res, next) {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
}

*/


export {asyncHandler}

/*
Methode: 2 wrapping with try and catch

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            error: error.message
        })
    }
}

above code using normal function

function asycnHandler(fn) {
    return async function(req, res, next) {
        try {
            await fn(req, res, next);
        } catch(error) {
            res.status(error.code || 500).json(
                status: fail,
                message: error.message
            )
        }
    }
}

*/