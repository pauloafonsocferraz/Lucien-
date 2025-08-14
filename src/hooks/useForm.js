import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

/**
 * Hook principal para gerenciamento de formulários
 * @description Hook completo para formulários com validação, estados, submissão
 * @param {Object} initialValues - Valores iniciais do formulário
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e funções do formulário
 */
export const useForm = (
  initialValues = {},
  {
    validationSchema = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    transform,
    onReset,
    onError,
    resetOnSubmit = false
  } = {}
) => {
  // ===== STATE =====
  const [values, setValuesState] = useState(initialValues);
  const [errors, setErrorsState] = useState({});
  const [touched, setTouchedState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ===== REFS =====
  const initialValuesRef = useRef(initialValues);
  const onSubmitRef = useRef(onSubmit);
  const onResetRef = useRef(onReset);
  const onErrorRef = useRef(onError);
  const transformRef = useRef(transform);
  const validationSchemaRef = useRef(validationSchema);

  // Atualiza refs quando props mudam
  useEffect(() => {
    onSubmitRef.current = onSubmit;
    onResetRef.current = onReset;
    onErrorRef.current = onError;
    transformRef.current = transform;
    validationSchemaRef.current = validationSchema;
  }, [onSubmit, onReset, onError, transform, validationSchema]);

  // ===== VALIDATION FUNCTIONS =====
  const validateField = useCallback(async (name, value, allValues) => {
    const schema = validationSchemaRef.current?.[name];
    if (!schema) return null;

    try {
      // Se schema é uma função
      if (typeof schema === 'function') {
        const result = await schema(value, allValues || values);
        return result || null;
      }

      // Se schema é um objeto com regras
      if (typeof schema === 'object') {
        // Required
        if (schema.required && (!value || value.toString().trim() === '')) {
          return schema.requiredMessage || `${name} é obrigatório`;
        }

        // Min length
        if (schema.minLength && value && value.toString().length < schema.minLength) {
          return schema.minLengthMessage || `${name} deve ter pelo menos ${schema.minLength} caracteres`;
        }

        // Max length
        if (schema.maxLength && value && value.toString().length > schema.maxLength) {
          return schema.maxLengthMessage || `${name} deve ter no máximo ${schema.maxLength} caracteres`;
        }

        // Min value (números)
        if (schema.min !== undefined && Number(value) < schema.min) {
          return schema.minMessage || `${name} deve ser pelo menos ${schema.min}`;
        }

        // Max value (números)
        if (schema.max !== undefined && Number(value) > schema.max) {
          return schema.maxMessage || `${name} deve ser no máximo ${schema.max}`;
        }

        // Pattern (regex)
        if (schema.pattern && value && !schema.pattern.test(value)) {
          return schema.patternMessage || `${name} tem formato inválido`;
        }

        // Email
        if (schema.email && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return schema.emailMessage || 'Email inválido';
          }
        }

        // Custom validator
        if (schema.validator && typeof schema.validator === 'function') {
          const result = await schema.validator(value, allValues || values);
          if (result !== true && result !== null && result !== undefined) {
            return result || `${name} é inválido`;
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Erro na validação do campo ${name}:`, error);
      return error.message || `Erro na validação de ${name}`;
    }
  }, [values]);

  const validateForm = useCallback(async (valuesToValidate) => {
    const currentValues = valuesToValidate || values;
    const schema = validationSchemaRef.current;
    
    if (!schema || Object.keys(schema).length === 0) {
      return true; // Sem validação = válido
    }

    setIsValidating(true);
    const newErrors = {};

    try {
      const validationPromises = Object.keys(schema).map(async (name) => {
        const error = await validateField(name, currentValues[name], currentValues);
        if (error) {
          newErrors[name] = error;
        }
        return { name, error };
      });

      await Promise.all(validationPromises);
      setErrorsState(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Erro na validação do formulário:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [values, validateField]);

  // ===== FIELD HANDLERS =====
  const setFieldValue = useCallback((name, value) => {
    setValuesState(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange) {
      validateField(name, value, { ...values, [name]: value }).then(error => {
        setErrorsState(prev => ({
          ...prev,
          [name]: error || undefined
        }));
      }).catch(err => {
        console.error('Erro na validação do campo:', err);
      });
    }
  }, [validateOnChange, validateField, values]);

  const setFieldError = useCallback((name, error) => {
    setErrorsState(prev => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (event) => {
      const value = event.target.type === 'checkbox' 
        ? event.target.checked 
        : event.target.value;
      setFieldValue(name, value);
    },
    onBlur: () => {
      setFieldTouched(name, true);
      if (validateOnBlur) {
        validateField(name, values[name], values).then(error => {
          setErrorsState(prev => ({
            ...prev,
            [name]: error || undefined
          }));
        }).catch(err => {
          console.error('Erro na validação onBlur:', err);
        });
      }
    }
  }), [values, setFieldValue, setFieldTouched, validateOnBlur, validateField]);

  const getFieldMeta = useCallback((name) => ({
    value: values[name],
    error: errors[name],
    touched: touched[name],
    hasError: !!(errors[name] && touched[name])
  }), [values, errors, touched]);

  // ===== FORM HANDLERS =====
  const handleSubmit = useCallback(async (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    setSubmitCount(prev => prev + 1);
    setIsSubmitted(true);
    
    // Marca todos os campos como tocados
    const schema = validationSchemaRef.current || {};
    const allTouched = Object.keys(schema).reduce((acc, name) => {
      acc[name] = true;
      return acc;
    }, {});
    setTouchedState(prev => ({ ...prev, ...allTouched }));

    // Valida se necessário
    let isValid = true;
    if (validateOnSubmit) {
      isValid = await validateForm();
    }

    if (!isValid) {
      if (onErrorRef.current) {
        onErrorRef.current(errors, values);
      }
      return;
    }

    if (!onSubmitRef.current) {
      console.warn('useForm: onSubmit não foi fornecido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Aplica transformação se fornecida
      let dataToSubmit = values;
      if (transformRef.current && typeof transformRef.current === 'function') {
        dataToSubmit = transformRef.current(values);
      }

      await onSubmitRef.current(dataToSubmit, {
        setFieldError,
        setFieldValue,
        setErrors: setErrorsState,
        resetForm,
        values,
        errors,
        touched
      });

      // Reseta se configurado
      if (resetOnSubmit) {
        resetForm();
      }

    } catch (error) {
      console.error('Erro na submissão:', error);
      
      // Se o erro contém erros de campo específicos
      if (error.fieldErrors && typeof error.fieldErrors === 'object') {
        setErrorsState(prev => ({ ...prev, ...error.fieldErrors }));
      }
      
      if (onErrorRef.current) {
        onErrorRef.current(error, values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, errors, touched, validateOnSubmit, validateForm, resetOnSubmit, setFieldError, setFieldValue]);

  const resetForm = useCallback((newValues = initialValuesRef.current) => {
    setValuesState(newValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
    setIsValidating(false);
    setSubmitCount(0);
    setIsSubmitted(false);

    if (onResetRef.current && typeof onResetRef.current === 'function') {
      onResetRef.current(newValues);
    }
  }, []);

  // ===== BULK OPERATIONS (com nomes diferentes) =====
  const updateValues = useCallback((newValues) => {
    if (typeof newValues === 'function') {
      setValuesState(prev => {
        const updated = newValues(prev);
        if (validateOnChange) {
          validateForm(updated);
        }
        return updated;
      });
    } else {
      setValuesState(newValues);
      if (validateOnChange) {
        validateForm(newValues);
      }
    }
  }, [validateOnChange, validateForm]);

  const updateErrors = useCallback((newErrors) => {
    if (typeof newErrors === 'function') {
      setErrorsState(prev => newErrors(prev));
    } else {
      setErrorsState(newErrors);
    }
  }, []);

  const updateTouched = useCallback((newTouched) => {
    if (typeof newTouched === 'function') {
      setTouchedState(prev => newTouched(prev));
    } else {
      setTouchedState(newTouched);
    }
  }, []);

  // ===== COMPUTED VALUES =====
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key]);
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  }, [values]);

  const dirtyFields = useMemo(() => {
    const dirty = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== initialValuesRef.current[key]) {
        dirty[key] = true;
      }
    });
    return dirty;
  }, [values]);

  const touchedFields = useMemo(() => {
    return Object.keys(touched).filter(key => touched[key]);
  }, [touched]);

  const errorFields = useMemo(() => {
    return Object.keys(errors).filter(key => errors[key]);
  }, [errors]);

  return {
    // Valores e estado
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    isValid,
    isDirty,
    isSubmitted,
    submitCount,
    
    // Campos computados
    dirtyFields,
    touchedFields,
    errorFields,
    
    // Handlers de campo
    setFieldValue,
    setFieldError,
    setFieldTouched,
    getFieldProps,
    getFieldMeta,
    
    // Handlers de formulário
    handleSubmit,
    resetForm,
    validateForm,
    validateField,
    
    // Operações em lote (nomes corrigidos)
    setValues: updateValues,
    setErrors: updateErrors,
    setTouched: updateTouched
  };
};

/**
 * Hook para campos de array dinâmicos - VERSÃO SIMPLIFICADA
 */
export const useFieldArray = (name, formik, defaultValue = '') => {
  const values = formik.values[name] || [];

  const push = useCallback((value = defaultValue) => {
    const newValues = [...values, value];
    formik.setFieldValue(name, newValues);
  }, [values, defaultValue, formik, name]);

  const remove = useCallback((index) => {
    if (index < 0 || index >= values.length) return;
    
    const newValues = values.filter((_, i) => i !== index);
    formik.setFieldValue(name, newValues);
    
    // Limpa erros relacionados ao array (simplificado)
    const newErrors = { ...formik.errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${name}[${index}]`) || key.startsWith(`${name}.${index}`)) {
        delete newErrors[key];
      }
    });
    formik.setErrors(newErrors);
  }, [values, formik, name]);

  const insert = useCallback((index, value = defaultValue) => {
    if (index < 0 || index > values.length) return;
    
    const newValues = [...values];
    newValues.splice(index, 0, value);
    formik.setFieldValue(name, newValues);
  }, [values, defaultValue, formik, name]);

  const replace = useCallback((index, value) => {
    if (index < 0 || index >= values.length) return;
    
    const newValues = [...values];
    newValues[index] = value;
    formik.setFieldValue(name, newValues);
  }, [values, formik, name]);

  const move = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex || 
        fromIndex < 0 || fromIndex >= values.length ||
        toIndex < 0 || toIndex >= values.length) return;
    
    const newValues = [...values];
    const [movedItem] = newValues.splice(fromIndex, 1);
    newValues.splice(toIndex, 0, movedItem);
    formik.setFieldValue(name, newValues);
  }, [values, formik, name]);

  return {
    values,
    push,
    remove,
    insert,
    replace,
    move,
    length: values.length
  };
};

/**
 * Validadores pré-definidos
 */
export const validators = {
  required: (message = 'Campo obrigatório') => ({
    required: true,
    requiredMessage: message
  }),

  email: (message = 'Email inválido') => ({
    email: true,
    emailMessage: message
  }),

  minLength: (length, message) => ({
    minLength: length,
    minLengthMessage: message || `Mínimo ${length} caracteres`
  }),

  maxLength: (length, message) => ({
    maxLength: length,
    maxLengthMessage: message || `Máximo ${length} caracteres`
  }),

  pattern: (regex, message = 'Formato inválido') => ({
    pattern: regex,
    patternMessage: message
  }),

  min: (value, message) => ({
    min: value,
    minMessage: message || `Valor mínimo: ${value}`
  }),

  max: (value, message) => ({
    max: value,
    maxMessage: message || `Valor máximo: ${value}`
  }),

  custom: (validator, message = 'Valor inválido') => ({
    validator,
    validatorMessage: message
  }),

  // Combinadores
  combine: (...validators) => {
    return validators.reduce((acc, validator) => ({ ...acc, ...validator }), {});
  }
};

export default useForm;
